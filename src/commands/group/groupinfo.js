import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'groupinfo',
  aliases: ['infogrup', 'gcinfo'],
  category: 'group',
  description: 'Melihat informasi lengkap tentang grup saat ini',
  usage: '',
  cooldown: 5,
  groupOnly: true,
  async execute({ msg, groupMetadata, reply }) {
    const participants = groupMetadata.participants || [];
    const admins = participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin');
    const creationDate = groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID') : '-';

    const infoText = `╭───「 *INFORMASI GRUP* 」───\n` +
      `│ 📛 *Nama* : ${groupMetadata.subject}\n` +
      `│ 🆔 *ID* : ${groupMetadata.id}\n` +
      `│ 👑 *Pembuat* : @${cleanJid(groupMetadata.owner || '')}\n` +
      `│ 📅 *Dibuat* : ${creationDate}\n` +
      `│ 👥 *Total Member* : ${participants.length} anggota\n` +
      `│ 👮‍♂️ *Total Admin* : ${admins.length} admin\n` +
      `│ 🔒 *Restricted* : ${groupMetadata.restrict ? 'Hanya Admin' : 'Semua Member'}\n` +
      `│ 📢 *Announcement* : ${groupMetadata.announce ? 'Hanya Admin Chat' : 'Semua Bisa Chat'}\n` +
      `│\n` +
      `│ 📝 *Deskripsi:*\n` +
      `│ ${groupMetadata.desc || 'Tidak ada deskripsi.'}\n` +
      `╰──────────────────────────`;

    await reply(infoText, {
      mentions: groupMetadata.owner ? [groupMetadata.owner] : []
    });
  }
};
