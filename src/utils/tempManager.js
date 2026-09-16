import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/config.js';
import logger from './logger.js';

class TempManager {
  constructor() {
    this.tempDir = config.tempDir;
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate a unique temp file path with an extension
   * @param {string} ext - extension (e.g. 'mp4', 'webp', 'jpg')
   * @returns {string} full path to temp file
   */
  createTempPath(ext = 'tmp') {
    this.ensureTempDir();
    const cleanExt = ext.replace(/^\./, '');
    const uniqueName = `temp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${cleanExt}`;
    return path.join(this.tempDir, uniqueName);
  }

  /**
   * Write a buffer to a new temp file
   * @param {Buffer} buffer
   * @param {string} ext
   * @returns {Promise<string>}
   */
  async writeTempFile(buffer, ext = 'tmp') {
    const filePath = this.createTempPath(ext);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }

  /**
   * Safely delete one or more temp files
   * @param {...string} filePaths
   */
  async cleanup(...filePaths) {
    for (const filePath of filePaths) {
      if (!filePath) continue;
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (err) {
        logger.warn(`Gagal menghapus temp file: ${filePath}`, err.message);
      }
    }
  }

  /**
   * Purge files in temp directory older than maxAgeMs (default 10 mins)
   * @param {number} maxAgeMs
   */
  async purgeOldFiles(maxAgeMs = 10 * 60 * 1000) {
    try {
      this.ensureTempDir();
      const files = await fs.promises.readdir(this.tempDir);
      const now = Date.now();
      let purgedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        try {
          const stats = await fs.promises.stat(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.promises.unlink(filePath);
            purgedCount++;
          }
        } catch {
          // ignore busy file
        }
      }

      if (purgedCount > 0) {
        logger.info(`TempManager membersihkan ${purgedCount} file temporary lama.`);
      }
    } catch (err) {
      logger.warn('Gagal menjalankan auto purge temp files:', err.message);
    }
  }
}

export const tempManager = new TempManager();
export default tempManager;
