import fs from 'fs';
import mediaHelper from '../../utils/ffmpeg.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'tomp3',
  aliases: ['mp3'],
  category: 'media',
  description: 'Mengonversi file video atau audio menjadi format MP3',
  usage: '[reply/kirim video]',
  cooldown: 8,
  async execute({ sock, msg, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const targetMsg = isQuoted ? msg.quoted : msg;
    const mime = targetMsg.mimetype || '';

    if (!/video|audio/.test(mime)) {
      return await reply('Kirim atau balas video/audio dengan perintah *!tomp3*.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengonversi ke MP3...');

    let inputPath;
    let outputPath;
    try {
      const buffer = await downloadMedia();
      if (!buffer) return await reply('❌ Gagal mengunduh media.');

      inputPath = await tempManager.writeTempFile(buffer, 'tmp');
      outputPath = await mediaHelper.toMp3(inputPath);

      const mp3Buffer = await fs.promises.readFile(outputPath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: mp3Buffer,
          mimetype: 'audio/mp4',
          fileName: `audio_${Date.now()}.mp3`
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
