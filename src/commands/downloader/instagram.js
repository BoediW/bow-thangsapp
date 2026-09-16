import fs from 'fs';
import DownloaderService from '../../utils/downloader.js';
import tempManager from '../../utils/tempManager.js';
import mediaLimits from '../../middleware/mediaLimits.js';

export default {
  name: 'instagram',
  aliases: ['ig', 'igdl', 'reels'],
  category: 'downloader',
  description: 'Mengunduh foto atau video Reels dari Instagram',
  usage: '<url_instagram>',
  cooldown: 10,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Gunakan format: *!instagram <url_instagram>*\nContoh: *!instagram https://www.instagram.com/reel/xxxxx*');
    }

    if (!DownloaderService.matchesPlatform('instagram', text.trim())) {
      return await reply('❌ URL Instagram tidak valid. Masukkan link post, reel, atau tv Instagram.');
    }

    if (!mediaLimits.acquireSlot()) {
      return await reply('⚠️ Server sedang memproses unduhan lain. Mohon tunggu beberapa detik.');
    }

    await reply('⏳ Mengambil data media Instagram...');

    let downloaded;
    try {
      const data = await DownloaderService.fetchInstagram(text.trim());
      if (!data.mediaUrl) {
        return await reply('❌ Tidak dapat menemukan media dari URL tersebut.');
      }

      await reply('⏳ Mengunduh media Instagram...');
      const ext = data.isVideo ? 'mp4' : 'jpg';
      downloaded = await DownloaderService.downloadFileToTemp(data.mediaUrl, ext);

      const buffer = await fs.promises.readFile(downloaded.filePath);

      if (data.isVideo) {
        await sock.sendMessage(
          msg.key.remoteJid,
          {
            video: buffer,
            caption: '📸 *Instagram Reel/Video*'
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          msg.key.remoteJid,
          {
            image: buffer,
            caption: '📸 *Instagram Post*'
          },
          { quoted: msg }
        );
      }
    } finally {
      mediaLimits.releaseSlot();
      if (downloaded && downloaded.filePath) {
        await tempManager.cleanup(downloaded.filePath);
      }
    }
  }
};
