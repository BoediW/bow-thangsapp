import fs from 'fs';
import mediaHelper from '../../utils/ffmpeg.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'resize',
  aliases: ['ubahukuran'],
  category: 'media',
  description: 'Mengubah resolusi/ukuran gambar',
  usage: '[reply/kirim gambar] <lebar>x<tinggi>',
  cooldown: 5,
  async execute({ sock, msg, text, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const targetMsg = isQuoted ? msg.quoted : msg;
    const mime = targetMsg.mimetype || '';

    if (!/image/.test(mime)) {
      return await reply('Kirim atau balas gambar dengan perintah:\n*!resize <lebar>x<tinggi>*\nContoh: *!resize 600x600*');
    }

    let width = 500;
    let height = 500;

    if (text && text.includes('x')) {
      const parts = text.split('x');
      const w = parseInt(parts[0].trim(), 10);
      const h = parseInt(parts[1].trim(), 10);
      if (!isNaN(w) && w > 10 && w <= 2500) width = w;
      if (!isNaN(h) && h > 10 && h <= 2500) height = h;
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply(`⏳ Mengubah resolusi gambar menjadi ${width}x${height}...`);

    let inputPath;
    let outputPath;
    try {
      const buffer = await downloadMedia();
      if (!buffer) return await reply('❌ Gagal mengunduh media.');

      inputPath = await tempManager.writeTempFile(buffer, 'jpg');
      outputPath = await mediaHelper.resizeImage(inputPath, width, height);

      const resizedBuffer = await fs.promises.readFile(outputPath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          image: resizedBuffer,
          caption: `✨ Gambar berhasil di-resize menjadi *${width}x${height}*.`
        },
        { quoted: msg }
      );
    } finally {
      mediaLimits.releaseSlot();
      if (inputPath) await tempManager.cleanup(inputPath);
      if (outputPath) await tempManager.cleanup(outputPath);
    }
  }
};
