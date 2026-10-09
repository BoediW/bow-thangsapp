import stickerHelper from '../../utils/sticker.js';
import mediaLimits from '../../middleware/mediaLimits.js';
import config from '../../config/config.js';
import sharp from 'sharp';

export default {
  name: 'creepypasta',
  aliases: ['cp', 'creepy'],
  category: 'sticker',
  description: 'Mengubah gambar atau stiker menjadi gaya seram (creepy pasta)',
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
      return await reply('Kirim/reply gambar atau stiker dengan command *!creepypasta* untuk membuatnya menjadi seram.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengubah menjadi seram...');

    try {
      let mediaBuffer = await downloadMedia();
      if (!mediaBuffer) {
        return await reply('❌ Gagal mengunduh media.');
      }

      try {
        // Apply Jeff the Killer style creepypasta effect: extreme contrast, grayscale, and harsh sharpening
        mediaBuffer = await sharp(mediaBuffer)
          .greyscale()
          .linear(3.5, -120) // Extreme contrast: crushes shadows to pitch black, blows highlights to pure white
          .blur(0.5) // Slight ghostly glow before sharpening
          .sharpen({ sigma: 6, m1: 20, m2: 20 }) // Extremely harsh edges to create a cursed/creepy texture
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
