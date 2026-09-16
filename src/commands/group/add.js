import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'add',
  aliases: ['tambah', 'undang'],
  category: 'group',
  description: 'Menambahkan nomor pengguna ke dalam grup',
  usage: '<nomor_telepon>',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Format: *!add 6281234567890*');
    }

    const cleanNumber = text.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 9 || cleanNumber.length > 15) {
      return await reply('❌ Format nomor telepon tidak valid. Gunakan kode negara (contoh: 628xxx).');
    }

    const targetJid = `${cleanNumber}@s.whatsapp.net`;

    try {
      const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'add');
      const status = response[0]?.status;

      if (status === '403') {
        return await reply(`⚠️ Nomor @${cleanJid(targetJid)} membatasi undangan grup (Privasi). Silakan gunakan link grup.`, {
          mentions: [targetJid]
        });
      }

      await reply(`✅ Berhasil menambahkan @${cleanJid(targetJid)} ke grup.`, {
        mentions: [targetJid]
      });
    } catch (err) {
      throw err;
    }
  }
};
