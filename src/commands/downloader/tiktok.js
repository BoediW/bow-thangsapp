import fs from 'fs';
import DownloaderService from '../../utils/downloader.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'tiktok',
  aliases: ['tt', 'ttdl', 'tiktokdl'],
  category: 'downloader',
  description: 'Mengunduh video TikTok tanpa watermark',
  usage: '<url_tiktok>',
  cooldown: 10,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Gunakan format: *!tiktok <url_tiktok>*\nContoh: *!tiktok https://vt.tiktok.com/xxxxx*');
    }

    if (!DownloaderService.matchesPlatform('tiktok', text.trim())) {
      return await reply('❌ URL TikTok tidak valid. Masukkan link tiktok.com, vt.tiktok.com, atau vm.tiktok.com.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang memproses media lain. Mohon tunggu beberapa detik.');
    }

    await reply('⏳ Mengambil data video TikTok...');

    let downloaded;
    try {
      const data = await DownloaderService.fetchTikTok(text.trim());
      if (!data.videoUrl) {
        return await reply('❌ Tidak dapat menemukan video dari URL tersebut.');
      }

      await reply('⏳ Mengunduh video tanpa watermark...');
      downloaded = await DownloaderService.downloadFileToTemp(data.videoUrl, 'mp4');

      const videoBuffer = await fs.promises.readFile(downloaded.filePath);

      const caption = `📱 *TikTok Video*\n` +
        `👤 Author: ${data.author}\n` +
        `📝 Deskripsi: ${data.title}\n` +
        `⏱ Durasi: ${data.duration} detik`;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: videoBuffer,
          caption
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
