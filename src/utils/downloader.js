import axios from 'axios';
import fs from 'fs';
import config from '../config/config.js';
import tempManager from './tempManager.js';
import logger from './logger.js';

export const URL_PATTERNS = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
  tiktok: /^(https?:\/\/)?(www\.|vm\.|vt\.)?tiktok\.com\/.+$/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/.+$/i
};

export class DownloaderService {
  /**
   * Validate if URL is a valid web URL
   * @param {string} url
   * @returns {boolean}
   */
  static isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Check if URL matches a specific platform pattern
   * @param {string} platform - 'youtube' | 'tiktok' | 'instagram'
   * @param {string} url
   * @returns {boolean}
   */
  static matchesPlatform(platform, url) {
    if (!this.isValidUrl(url)) return false;
    const pattern = URL_PATTERNS[platform];
    return pattern ? pattern.test(url) : false;
  }

  /**
   * Download a file from a URL to a local temporary file with strict size enforcement
   * @param {string} fileUrl
   * @param {string} ext
   * @returns {Promise<{ filePath: string, size: number, mime: string }>}
   */
  static async downloadFileToTemp(fileUrl, ext = 'tmp') {
    const maxBytes = config.maxFileSizeMB * 1024 * 1024;
    const tempPath = tempManager.createTempPath(ext);

    // Initial HEAD check
    try {
      const headRes = await axios.head(fileUrl, { timeout: 10000 }).catch(() => null);
      if (headRes && headRes.headers['content-length']) {
        const contentLength = parseInt(headRes.headers['content-length'], 10);
        if (contentLength > maxBytes) {
          throw new Error(`Ukuran file (${Math.round(contentLength / 1024 / 1024)} MB) melebihi batas maksimal (${config.maxFileSizeMB} MB).`);
        }
      }
    } catch (err) {
      if (err.message.includes('melebihi batas')) throw err;
    }

    // Stream download with chunk counter
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const contentType = response.headers['content-type'] || '';
    let downloadedBytes = 0;
    const writer = fs.createWriteStream(tempPath);

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (downloadedBytes > maxBytes) {
          response.data.destroy();
          writer.close();
          tempManager.cleanup(tempPath);
          reject(new Error(`Ukuran file melebihi batas maksimal (${config.maxFileSizeMB} MB).`));
        }
      });

      response.data.pipe(writer);

      writer.on('finish', () => {
        resolve({
          filePath: tempPath,
          size: downloadedBytes,
          mime: contentType
        });
      });

      writer.on('error', (err) => {
        tempManager.cleanup(tempPath);
        reject(err);
      });
    });
  }

  // --- Platform Providers ---
  // Modular provider methods. If an external public endpoint changes, update provider implementation here.

  /**
   * Fetch TikTok Video Details
   * @param {string} url
   */
  static async fetchTikTok(url) {
    if (!this.matchesPlatform('tiktok', url)) {
      throw new Error('URL TikTok tidak valid.');
    }

    try {
      // Menggunakan public API provider (TikWM API endpoint resmi)
      const res = await axios.post('https://www.tikwm.com/api/', { url }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
      });

      const data = res.data;
      if (!data || data.code !== 0 || !data.data) {
        throw new Error(data?.msg || 'Gagal mengambil data video TikTok.');
      }

      const videoData = data.data;
      return {
        title: videoData.title || 'TikTok Video',
        author: videoData.author?.nickname || 'Creator',
        duration: videoData.duration || 0,
        videoUrl: videoData.play || videoData.wmplay,
        musicUrl: videoData.music,
        thumbnail: videoData.cover
      };
    } catch (err) {
      logger.error('Error fetchTikTok:', err.message);
      throw new Error(err.message || 'Gagal memproses video TikTok.');
    }
  }

  /**
   * Fetch Instagram Media Details
   * @param {string} url
   */
  static async fetchInstagram(url) {
    if (!this.matchesPlatform('instagram', url)) {
      throw new Error('URL Instagram tidak valid.');
    }

    try {
      // Menggunakan public provider snapinsta/fastdl scraper endpoint
      const apiUrl = `https://api.vkrdown.com/api/insta?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl, { timeout: 15000 });

      if (res.data && res.data.data && res.data.data.length > 0) {
        const item = res.data.data[0];
        return {
          title: 'Instagram Post',
          mediaUrl: item.url || item.download_url,
          isVideo: item.type === 'video' || (item.url && item.url.includes('.mp4'))
        };
      }

      throw new Error('Konten Instagram tidak ditemukan atau akun di-private.');
    } catch (err) {
      logger.error('Error fetchInstagram:', err.message);
      throw new Error(err.message || 'Gagal memproses media Instagram. Pastikan postingan publik.');
    }
  }

  /**
   * Fetch YouTube Audio / Video info
   * @param {string} url
   * @param {'audio'|'video'} type
   */
  static async fetchYouTube(url, type = 'video') {
    if (!this.matchesPlatform('youtube', url)) {
      throw new Error('URL YouTube tidak valid.');
    }

    try {
      // Menggunakan public cobalt / ytdl endpoint wrapper
      const endpoint = 'https://api.cobalt.tools/api/json';
      const payload = {
        url,
        downloadMode: type === 'audio' ? 'audio' : 'auto',
        audioFormat: 'mp3',
        filenameStyle: 'basic'
      };

      const res = await axios.post(endpoint, payload, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }).catch(() => null);

      if (res && res.data && res.data.url) {
        return {
          title: res.data.filename || `YouTube ${type}`,
          downloadUrl: res.data.url,
          type
        };
      }

      // Fallback secondary endpoint jika primary sibuk
      const fallbackUrl = `https://ytdl.siputzx.my.id/api/ytdl?url=${encodeURIComponent(url)}`;
      const fallbackRes = await axios.get(fallbackUrl, { timeout: 15000 }).catch(() => null);

      if (fallbackRes && fallbackRes.data && fallbackRes.data.data) {
        const data = fallbackRes.data.data;
        const mediaUrl = type === 'audio' ? (data.mp3 || data.audio) : (data.mp4 || data.video);
        if (mediaUrl) {
          return {
            title: data.title || `YouTube ${type}`,
            downloadUrl: mediaUrl,
            type
          };
        }
      }

      throw new Error('Layanan unduhan YouTube sementara sedang sibuk. Silakan coba lagi nanti.');
    } catch (err) {
      logger.error(`Error fetchYouTube (${type}):`, err.message);
      throw new Error(err.message || `Gagal memproses YouTube ${type}.`);
    }
  }
}

export default DownloaderService;
