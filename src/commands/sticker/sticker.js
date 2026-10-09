import stickerHelper from '../../utils/sticker.js';
import mediaLimits from '../../middleware/mediaLimits.js';
import config from '../../config/config.js';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'sticker',
  description: 'Mengubah gambar atau video pendek menjadi stiker WhatsApp',
  usage: '[caption atau reply media]',
  cooldown: 5,
  async execute({ sock, msg, text, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const target = isQuoted ? msg.quoted : msg;
    const inner = target.message || target;

    let mime = target.mimetype || '';
    if (!mime) {
      if (inner.imageMessage) mime = inner.imageMessage.mimetype || 'image/jpeg';
      else if (inner.videoMessage) mime = inner.videoMessage.mimetype || 'video/mp4';
      else if (inner.stickerMessage) mime = inner.stickerMessage.mimetype || 'image/webp';
    }

    const isImage = /image/i.test(mime) || !!inner.imageMessage;
    const isVideo = /video/i.test(mime) || !!inner.videoMessage;

    if (!isImage && !isVideo) {
      return await reply('Kirim gambar/video pendek dengan caption *!sticker* atau reply gambar/video yang sudah ada.');
    }

    if (isVideo) {
      const seconds = inner.videoMessage?.seconds || 0;
      if (seconds > 10) {
        return await reply('⚠️ Durasi video terlalu panjang. Maksimal 10 detik untuk stiker animasi.');
      }
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Processing...');

    try {
      const mediaBuffer = await downloadMedia();
      if (!mediaBuffer) {
        return await reply('❌ Gagal mengunduh media.');
      }

      // Parse custom pack/author if passed e.g. !sticker MyPack|MyAuthor
      let pack = config.stickerPack;
      let author = config.stickerAuthor;

      if (text && text.includes('|')) {
        const parts = text.split('|');
        pack = parts[0].trim() || pack;
        author = parts[1].trim() || author;
      }

      const stickerBuff = await stickerHelper.createSticker(mediaBuffer, {
        isVideo,
        pack,
        author
      });

      await sock.sendMessage(
        msg.key.remoteJid,
        { sticker: stickerBuff },
        { quoted: msg }
      );
    } finally {
      mediaLimits.releaseSlot();
    }
  }
};
