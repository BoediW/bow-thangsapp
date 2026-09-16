import fs from 'fs';
import DownloaderService from '../../utils/downloader.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'ytmp3',
  aliases: ['yta', 'ytaudio'],
  category: 'downloader',
  description: 'Mengunduh audio MP3 dari tautan YouTube',
  usage: '<url_youtube>',
  cooldown: 10,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Gunakan format: *!ytmp3 <url_youtube>*\nContoh: *!ytmp3 https://youtu.be/xxxxx*');
    }

    if (!DownloaderService.matchesPlatform('youtube', text.trim())) {
      return await reply('❌ URL YouTube tidak valid. Pastikan tautan dari youtube.com atau youtu.be.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang memproses unduhan lain. Mohon tunggu beberapa detik.');
    }

    await reply('⏳ Sedang mencari dan memproses audio YouTube...');

    let downloaded;
    try {
      const info = await DownloaderService.fetchYouTube(text.trim(), 'audio');
      if (!info.downloadUrl) {
        return await reply('❌ Gagal mendapatkan tautan unduhan audio.');
      }

      await reply('⏳ Mengunduh audio ke server...');
      downloaded = await DownloaderService.downloadFileToTemp(info.downloadUrl, 'mp3');

      const audioBuffer = await fs.promises.readFile(downloaded.filePath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: audioBuffer,
          mimetype: 'audio/mp4',
          fileName: `${info.title || 'YouTube_Audio'}.mp3`
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
