import fs from 'fs';
import mediaHelper from '../../utils/ffmpeg.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';
import { formatBytes } from '../../utils/formatter.js';

export default {
  name: 'compress',
  aliases: ['kompres'],
  category: 'media',
  description: 'Mengompres ukuran file video agar lebih ringan',
  usage: '[reply/kirim video]',
  cooldown: 10,
  async execute({ sock, msg, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const targetMsg = isQuoted ? msg.quoted : msg;
    const mime = targetMsg.mimetype || '';

    if (!/video/.test(mime)) {
      return await reply('Kirim atau balas video dengan perintah *!compress*.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengompres video, mohon tunggu...');

    let inputPath;
    let outputPath;
    try {
      const buffer = await downloadMedia();
      if (!buffer) return await reply('❌ Gagal mengunduh media.');

      const originalSize = buffer.length;
      inputPath = await tempManager.writeTempFile(buffer, 'mp4');
      outputPath = await mediaHelper.compressVideo(inputPath);

      const compressedBuffer = await fs.promises.readFile(outputPath);
      const newSize = compressedBuffer.length;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: compressedBuffer,
          caption: `✨ Kompresi Berhasil!\n📉 Ukuran: ${formatBytes(originalSize)} ➔ *${formatBytes(newSize)}*`
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
