import fs from 'fs';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'gif',
  aliases: ['togif'],
  category: 'media',
  description: 'Mengonversi video pendek menjadi animasi GIF WhatsApp',
  usage: '[reply/kirim video]',
  cooldown: 8,
  async execute({ sock, msg, reply, downloadMedia }) {
    const isQuoted = !!msg.quoted;
    const targetMsg = isQuoted ? msg.quoted : msg;
    const mime = targetMsg.mimetype || '';

    if (!/video/.test(mime)) {
      return await reply('Kirim atau balas video pendek dengan perintah *!gif*.');
    }

    if (targetMsg.seconds > 15) {
      return await reply('⚠️ Durasi video maksimal 15 detik untuk dijadikan GIF.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang sibuk memproses media lain. Silakan coba sesaat lagi.');
    }

    await reply('⏳ Mengonversi ke format GIF...');

    try {
      const buffer = await downloadMedia();
      if (!buffer) return await reply('❌ Gagal mengunduh media.');

      // Send as looping MP4 GIF in WhatsApp
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: buffer,
          caption: '✨ Animasi GIF',
          gifPlayback: true
        },
        { quoted: msg }
      );
    } finally {
      mediaLimits.releaseSlot();
    }
  }
};
