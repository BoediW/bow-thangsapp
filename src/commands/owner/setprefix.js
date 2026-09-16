import db from '../../database/database.js';

export default {
  name: 'setprefix',
  aliases: ['prefix'],
  category: 'owner',
  description: 'Mengubah karakter prefix pemanggilan perintah bot',
  usage: '<simbol_prefix>',
  cooldown: 5,
  ownerOnly: true,
  async execute({ text, reply }) {
    if (!text || text.trim().length === 0) {
      const current = db.getPrefix();
      return await reply(`Prefix saat ini adalah: *${current}*\nUntuk mengubah, gunakan: *${current}setprefix #*`);
    }

    const newPrefix = text.trim();
    if (newPrefix.length > 3) {
      return await reply('❌ Prefix maksimal 3 karakter.');
    }

    db.setPrefix(newPrefix);
    await reply(`✅ Prefix berhasil diubah menjadi: *${newPrefix}*\nContoh penggunaan: *${newPrefix}menu*`);
  }
};
