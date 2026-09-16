import fs from 'fs';
import mediaHelper from '../../utils/ffmpeg.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'toaudio',
  aliases: ['tovn', 'vn'],
  category: 'media',
  description: 'Mengonversi media video atau file audio menjadi Voice Note WhatsApp',
  usage: '[reply/kirim video]',
  cooldown: 8,
  async execute({ sock, msg, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const targetMsg = isQuoted ? msg.quoted : msg;
    const mime = targetMsg.mimetype || '';

    if (!/video|audio/.test(mime)) {
      return await reply('Kirim atau balas video/audio dengan perintah *!toaudio*.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengonversi ke Voice Note...');

    let inputPath;
    let outputPath;
    try {
      const buffer = await downloadMedia();
      if (!buffer) return await reply('❌ Gagal mengunduh media.');

      inputPath = await tempManager.writeTempFile(buffer, 'tmp');
      outputPath = await mediaHelper.toVoiceNote(inputPath);

      const oggBuffer = await fs.promises.readFile(outputPath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: oggBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
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
