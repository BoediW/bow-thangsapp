import fs from 'fs';
import sharp from 'sharp';
import mediaHelper from '../../utils/ffmpeg.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'toimg',
  aliases: ['toimage', 'tovideo'],
  category: 'sticker',
  description: 'Mengubah stiker kembali menjadi gambar atau video',
  usage: '[reply stiker]',
  cooldown: 5,
  async execute({ sock, msg, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const target = isQuoted ? msg.quoted : msg;
    const inner = target.message || target;

    const isSticker = /webp/i.test(target.mimetype || '') || !!inner.stickerMessage;
    if (!isSticker) {
      return await reply('Balas (reply) sebuah stiker dengan perintah *!toimg*.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengonversi stiker ke gambar...');

    let tempWebp;
    let tempPng;
    try {
      const stickerBuff = await downloadMedia();
      if (!stickerBuff) {
        return await reply('❌ Gagal mengunduh stiker.');
      }

      let imageBuffer;
      try {
        imageBuffer = await sharp(stickerBuff).png().toBuffer();
      } catch {
        tempWebp = await tempManager.writeTempFile(stickerBuff, 'webp');
        tempPng = await mediaHelper.webpToPng(tempWebp);
        imageBuffer = await fs.promises.readFile(tempPng);
      }

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          image: imageBuffer,
          caption: '✨ Berhasil dikonversi dari stiker.'
        },
        { quoted: msg }
      );
    } finally {
      mediaLimits.releaseSlot();
      if (tempWebp) await tempManager.cleanup(tempWebp);
      if (tempPng) await tempManager.cleanup(tempPng);
    }
  }
};
