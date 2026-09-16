import fs from 'fs';
import DownloaderService from '../../utils/downloader.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'ytmp4',
  aliases: ['ytv', 'ytvideo'],
  category: 'downloader',
  description: 'Mengunduh video MP4 dari tautan YouTube',
  usage: '<url_youtube>',
  cooldown: 12,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Gunakan format: *!ytmp4 <url_youtube>*\nContoh: *!ytmp4 https://youtu.be/xxxxx*');
    }

    if (!DownloaderService.matchesPlatform('youtube', text.trim())) {
      return await reply('❌ URL YouTube tidak valid. Pastikan tautan dari youtube.com atau youtu.be.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang memproses unduhan lain. Mohon tunggu beberapa detik.');
    }

    await reply('⏳ Sedang memproses video YouTube...');

    let downloaded;
    try {
      const info = await DownloaderService.fetchYouTube(text.trim(), 'video');
      if (!info.downloadUrl) {
        return await reply('❌ Gagal mendapatkan tautan unduhan video.');
      }

      await reply('⏳ Mengunduh video ke server...');
      downloaded = await DownloaderService.downloadFileToTemp(info.downloadUrl, 'mp4');

      const videoBuffer = await fs.promises.readFile(downloaded.filePath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: videoBuffer,
          caption: `🎬 *${info.title || 'YouTube Video'}*`
        },
        { quoted: msg }
      );
    } finally {
      mediaLimits.releaseSlot();
      if (downloaded && downloaded.filePath) {
        await tempManager.cleanup(downloaded.filePath);
      }
    }
  }
};
