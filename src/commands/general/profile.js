import db from '../../database/database.js';
import config from '../../config/config.js';
import { cleanJid } from '../../utils/formatter.js';

const RARITY_BADGES = {
  SECRET: '🌟 [SECRET]',
  LEGENDARY: '👑 [LEGENDARY]',
  EPIC: '🔥 [EPIC]',
  RARE: '💎 [RARE]',
  COMMON: '⚪ [COMMON]'
};

/**
 * Find the rarity of a race name by looking it up in the gacha pool.
 * Falls back to 'COMMON' if not found.
 */
function getRaceRarity(raceName) {
  const RACE_POOL = {
    SECRET: ['Japanese', 'European', 'British'],
    LEGENDARY: ['Cina'],
    EPIC: ['Negro'],
    RARE: ['Jawa', 'Batak', 'Bugis'],
    COMMON: ['Madura', 'Dayak', 'Minang', 'Padang', 'Sunda', 'Bali', 'Ambon', 'Papua']
  };

  for (const [rarity, races] of Object.entries(RACE_POOL)) {
    if (races.some(r => r.toLowerCase() === raceName.toLowerCase())) {
      return rarity;
    }
  }
  return 'COMMON';
}

/**
 * Resolve display info (phone number & name) from a JID.
 *
 * Baileys LID connections use internal IDs (@lid) that aren't phone numbers.
 * This function cross-references groupMetadata.participants to find the real
 * phone-based JID (@s.whatsapp.net), and also extracts the contact name
 * (the "notify" field) from the participant entry.
 */
function resolveUserDisplay(targetJid, groupMetadata) {
  let phoneNumber = null;
  let contactName = null;

  // If the JID is already phone-based, extract directly
  if (targetJid.endsWith('@s.whatsapp.net')) {
    phoneNumber = targetJid.split('@')[0].split(':')[0];
  }

  // Cross-reference with group metadata participants
  if (groupMetadata?.participants) {
    const targetClean = targetJid.split('@')[0].split(':')[0];

    for (const p of groupMetadata.participants) {
      const pIdClean = p.id?.split('@')[0]?.split(':')[0];
      const pLidClean = p.lid?.split('@')[0]?.split(':')[0];

      if (pIdClean === targetClean || pLidClean === targetClean) {
        // Get real phone number from participant.id (phone JID)
        if (!phoneNumber && p.id?.endsWith('@s.whatsapp.net')) {
          phoneNumber = p.id.split('@')[0].split(':')[0];
        }
        // Get contact display name
        if (p.notify) {
          contactName = p.notify;
        }
        break;
      }
    }
  }

  return { phoneNumber, contactName };
}

/**
 * Build a formatted profile text for a given user.
 */
function buildProfileText({ name, phone, statusLabel, user, prefix, isSelf }) {
  const race = user.race || 'Manusia Biasa';
  const rarity = (user.raceRarity || 'COMMON').toUpperCase();
  const badge = RARITY_BADGES[rarity] || '⚪ [COMMON]';

  // Build inventory list with rarity badges
  const inventory = Array.isArray(user.inventoryRaces) && user.inventoryRaces.length > 0
    ? user.inventoryRaces.map((r) => {
        const rRarity = getRaceRarity(r);
        const rBadge = RARITY_BADGES[rRarity] || '⚪';
        const marker = r === race ? ' ✅' : '';
        return `${r} ${rBadge}${marker}`;
      }).join('\n│    ')
    : race;

  const phoneDisplay = phone ? `+${phone}` : '_Tersembunyi_';
  const header = isSelf ? '*PROFIL PENGGUNA*' : `*PROFIL ${name.toUpperCase()}*`;

  let text =
    `╭───「 ${header} 」───╮\n` +
    `│\n` +
    `│ 👤 *Nama*         : ${name}\n` +
    `│ 📱 *Nomor*        : ${phoneDisplay}\n` +
    `│ 🔰 *Status*       : ${statusLabel}\n` +
    `│ 💰 *Saldo Casino* : $${(user.balance || 0).toLocaleString('id-ID')}\n` +
    `│ 🎫 *Token Gacha*  : ${user.gachaTokens || 0} Token\n` +
    `│\n` +
    `├── 「 *DATA RAS / SUKU* 」\n` +
    `│ 🧬 *Ras Utama*    : *${race}*\n` +
    `│ 🏷 *Rarity*       : ${badge}\n` +
    `│ 📚 *Koleksi Ras*  :\n` +
    `│    ${inventory}\n` +
    `│\n` +
    `├── 「 *STATISTIK* 」\n` +
    `│ 📊 *Command Used* : ${user.commandsUsed || 0}x\n` +
    `│\n` +
    `╰───────────────────────\n\n`;

  if (isSelf) {
    text +=
      `💡 _Ketik \`${prefix}gacha\` untuk gacha ras baru!_\n` +
      `💡 _Ketik \`${prefix}token\` untuk ambil token harian!_\n` +
      `💡 _Ketik \`${prefix}profile setras <nama>\` untuk ganti ras utama!_`;
  } else {
    text += `💡 _Ini adalah profil member lain. Ketik \`${prefix}profile\` untuk melihat profilmu._`;
  }

  return text;
}

export default {
  name: 'profile',
  aliases: ['profil', 'me', 'my'],
  category: 'general',
  description: 'Lihat profil sendiri/member lain, atau ganti ras utama',
  usage: '[@tag / reply / setras <nama_ras>]',
  cooldown: 3,
  async execute({ sock, msg, sender, pushName, reply, prefix, args, text, groupMetadata }) {

    // ─── SUB-COMMAND: setras ───────────────────────────
    if (args.length >= 2 && args[0].toLowerCase() === 'setras') {
      const raceName = args.slice(1).join(' ').trim();
      const user = db.getUser(sender);
      const inventory = Array.isArray(user.inventoryRaces) ? user.inventoryRaces : [];

      if (inventory.length === 0) {
        return await reply(
          `❌ *Kamu belum punya koleksi ras!*\n\n` +
          `💡 Ketik \`${prefix}gacha\` untuk mendapatkan ras pertamamu.`
        );
      }

      // Case-insensitive match from inventory
      const match = inventory.find(r => r.toLowerCase() === raceName.toLowerCase());
      if (!match) {
        const listText = inventory.map((r, i) => {
          const rRarity = getRaceRarity(r);
          const rBadge = RARITY_BADGES[rRarity] || '⚪';
          const marker = r === (user.race || '') ? ' ✅ _(aktif)_' : '';
          return `${i + 1}. *${r}* ${rBadge}${marker}`;
        }).join('\n');

        return await reply(
          `❌ *Ras "${raceName}" tidak ditemukan di koleksimu!*\n\n` +
          `📚 *Koleksi Ras Kamu:*\n${listText}\n\n` +
          `💡 Ketik \`${prefix}profile setras <nama_ras>\` untuk ganti.\n` +
          `📝 Contoh: \`${prefix}profile setras Batak\``
        );
      }

      // Already active check
      if (match === user.race) {
        return await reply(`⚠️ *${match}* sudah menjadi ras utamamu saat ini!`);
      }

      const newRarity = getRaceRarity(match);
      db.updateUser(sender, {
        race: match,
        raceRarity: newRarity
      });

      const badge = RARITY_BADGES[newRarity] || '⚪ [COMMON]';
      return await reply(
        `✅ *Ras Utama Berhasil Diganti!*\n\n` +
        `🧬 *Ras Baru*  : *${match}*\n` +
        `🏷 *Rarity*   : ${badge}\n\n` +
        `💡 Ketik \`${prefix}profile\` untuk melihat profilmu yang diperbarui.`
      );
    }

    // ─── DETERMINE TARGET USER ─────────────────────────
    let targetJid = sender;
    let isSelf = true;

    // Priority 1: Mentioned user via @tag
    const mentioned = msg.mentionedJid || [];
    if (mentioned.length > 0) {
      targetJid = mentioned[0];
      isSelf = (targetJid === sender);
    }
    // Priority 2: Quoted/reply message sender
    else if (msg.quoted && msg.quoted.sender) {
      targetJid = msg.quoted.sender;
      isSelf = (targetJid === sender);
    }

    // Fetch target user data from database
    const targetUser = db.getUser(targetJid);

    // Resolve real phone number & contact name via group metadata cross-reference
    const { phoneNumber, contactName } = resolveUserDisplay(targetJid, groupMetadata);

    // Determine the best display name
    let displayName;
    if (isSelf) {
      displayName = pushName || contactName || targetUser.name || 'User';
    } else {
      // For other members: prefer contact name from group, then stored name, then phone
      displayName = contactName || targetUser.name || (phoneNumber ? `+${phoneNumber}` : 'User');
    }

    // Determine status label
    const isOwner = config.ownerNumbers.some((num) => targetJid.includes(num));
    const isPrem = targetUser.isPremium || db.isPremium(targetJid);
    let statusLabel = '👤 Member';
    if (isOwner) statusLabel = '👑 Owner';
    else if (isPrem) statusLabel = '⭐ Premium';

    const profileText = buildProfileText({
      name: displayName,
      phone: phoneNumber,
      statusLabel,
      user: targetUser,
      prefix,
      isSelf
    });

    await reply(profileText);
  }
};
