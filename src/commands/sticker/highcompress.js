import stickerHelper from '../../utils/sticker.js';
import mediaLimits from '../../middleware/mediaLimits.js';
import config from '../../config/config.js';
import sharp from 'sharp';

export default {
  name: 'highcompress',
  aliases: ['superburik', 'superpecah'],
  category: 'sticker',
  description: 'Mengubah gambar atau stiker menjadi kualitas 5x lebih burik/pecah dari compress',
  usage: '[reply gambar/stiker]',
  cooldown: 5,
  async execute({ sock, msg, reply, downloadMedia }) {
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
    const isSticker = /webp/i.test(mime) || !!inner.stickerMessage;

    if (!isImage && !isSticker) {
      return await reply('Kirim/reply gambar atau stiker dengan command *!highcompress* untuk membuatnya menjadi super burik.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengkompres dan membuat super burik (5x lipat)...');

    try {
      let mediaBuffer = await downloadMedia();
      if (!mediaBuffer) {
        return await reply('❌ Gagal mengunduh media.');
      }

      try {
        // Pixelate and add extremely heavy JPEG artifacts
        mediaBuffer = await sharp(mediaBuffer)
          .resize(8, 8, { fit: 'inside' }) // resize to extremely small
          .resize(512, 512, { kernel: 'nearest' }) // scale back up blocky
          .jpeg({ quality: 1 }) // heavy jpeg compression artifacts
          .toBuffer();
      } catch (err) {
        return await reply('❌ Gagal memproses gambar/stiker. Pastikan formatnya didukung.');
      }

      if (isSticker) {
        const stickerBuff = await stickerHelper.createSticker(mediaBuffer, {
          isVideo: false,
          pack: config.stickerPack,
          author: config.stickerAuthor
        });

        await sock.sendMessage(
          msg.key.remoteJid,
          { sticker: stickerBuff },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          msg.key.remoteJid,
          { image: mediaBuffer },
          { quoted: msg }
        );
      }
    } catch (error) {
      await reply('❌ Terjadi kesalahan: ' + error.message);
    } finally {
      mediaLimits.releaseSlot();
    }
  }
};
