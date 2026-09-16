import stickerHelper from '../../utils/sticker.js';
import config from '../../config/config.js';

export default {
  name: 'take',
  aliases: ['wm', 'colong', 'steal'],
  category: 'sticker',
  description: 'Mengubah metadata pack name dan author pada stiker',
  usage: '[reply stiker] <pack|author>',
  cooldown: 5,
  async execute({ sock, msg, text, reply, downloadMedia }) {
    if (!msg.quoted || !/webp/.test(msg.quoted.mimetype || '')) {
      return await reply('Balas (reply) stiker yang ingin diubah metadatanya dengan format:\n*!take NamaPack|NamaAuthor*');
    }

    let pack = config.stickerPack;
    let author = config.stickerAuthor;

    if (text) {
      if (text.includes('|')) {
        const parts = text.split('|');
        pack = parts[0].trim() || pack;
        author = parts[1].trim() || author;
      } else {
        pack = text.trim();
      }
    }

    await reply('⏳ Memperbarui metadata stiker...');

    try {
      const stickerBuff = await downloadMedia();
      if (!stickerBuff) {
        return await reply('❌ Gagal mengunduh stiker.');
      }

      const updatedSticker = await stickerHelper.changeMetadata(stickerBuff, pack, author);

      await sock.sendMessage(
        msg.key.remoteJid,
        { sticker: updatedSticker },
        { quoted: msg }
      );
    } catch (err) {
      throw err;
    }
  }
};
