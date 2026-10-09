import db from '../../database/database.js';

const RACE_POOL = {
  SECRET: {
    name: 'SECRET',
    chance: '0.0001%',
    badge: '🌟 [SECRET] 🌟',
    races: ['Japanese', 'European', 'British', 'Middle East']
  },
  LEGENDARY: {
    name: 'LEGENDARY',
    chance: '0.2%',
    badge: '👑 [LEGENDARY] 👑',
    races: ['Cina']
  },
  EPIC: {
    name: 'EPIC',
    chance: '4%',
    badge: '🔥 [EPIC] 🔥',
    races: ['Negro']
  },
  RARE: {
    name: 'RARE',
    chance: '10%',
    badge: '💎 [RARE] 💎',
    races: ['Jawa', 'Batak', 'Bugis']
  },
  COMMON: {
    name: 'COMMON',
    chance: '85.7999%',
    badge: '⚪ [COMMON] ⚪',
    races: ['Madura', 'Dayak', 'Minang', 'Padang', 'Sunda', 'Bali', 'Ambon', 'Papua']
  }
};

export default {
  name: 'gacha',
  aliases: ['gacharas', 'spinras', 'ras'],
  category: 'fun',
  description: 'Gacha untuk menentukan Ras / Suku kamu',
  usage: '',
  cooldown: 3,
  async execute({ sender, reply, prefix }) {
    const user = db.getUser(sender);

    if ((user.gachaTokens || 0) < 1) {
      return await reply(
        `❌ *Token Gacha kamu habis!*\n\n` +
        `🎫 Sisa Token: *0 Token*\n` +
        `💡 Ketik \`${prefix}token\` untuk mengambil bonus token harian gratis!`
      );
    }

    // Deduct 1 token
    const newTokens = user.gachaTokens - 1;
    const rand = Math.random() * 100; // 0 to 100

    let chosenCategory = RACE_POOL.COMMON;
    if (rand <= 0.0001) {
      chosenCategory = RACE_POOL.SECRET;
    } else if (rand <= 0.2001) {
      chosenCategory = RACE_POOL.LEGENDARY;
    } else if (rand <= 4.2001) {
      chosenCategory = RACE_POOL.EPIC;
    } else if (rand <= 14.2001) {
      chosenCategory = RACE_POOL.RARE;
    } else {
      chosenCategory = RACE_POOL.COMMON;
    }

    const rolledRace = chosenCategory.races[Math.floor(Math.random() * chosenCategory.races.length)];
    const inventory = Array.isArray(user.inventoryRaces) ? [...user.inventoryRaces] : [];
    if (!inventory.includes(rolledRace)) {
      inventory.push(rolledRace);
    }

    db.updateUser(sender, {
      gachaTokens: newTokens,
      race: rolledRace,
      raceRarity: chosenCategory.name,
      inventoryRaces: inventory
    });

    await reply(
      `🎰 *RACE GACHA SPINNER* 🎰\n\n` +
      `✨ *SELAMAT! KAMU MENDAPATKAN RAS:* ✨\n` +
      `${chosenCategory.badge} *${rolledRace}*\n` +
      `📊 *Tingkat Kelangkaan:* ${chosenCategory.name} (${chosenCategory.chance})\n\n` +
      `🎫 *Sisa Token:* ${newTokens} Token\n` +
      `💡 Ketik \`${prefix}profile\` untuk melihat profil lengkap kamu!`
    );
  }
};
