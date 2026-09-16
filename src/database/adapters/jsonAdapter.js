import fs from 'fs';
import path from 'path';
import config from '../../config/config.js';
import logger from '../../utils/logger.js';
import { defaultSchema } from '../schema.js';

export class JsonAdapter {
  constructor(filePath) {
    this.filePath = filePath || path.join(config.dataDir, 'database.json');
    this.data = JSON.parse(JSON.stringify(defaultSchema));
    this.saveTimeout = null;
    this.isSaving = false;
  }

  async init() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = await fs.promises.readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...JSON.parse(JSON.stringify(defaultSchema)),
          ...parsed,
          settings: { ...defaultSchema.settings, ...(parsed.settings || {}) },
          stats: { ...defaultSchema.stats, ...(parsed.stats || {}) }
        };
        logger.info(`Database JSON berhasil dimuat dari: ${this.filePath}`);
      } catch (err) {
        logger.error('Error saat membaca database JSON, membuat backup...', err);
        const backupPath = `${this.filePath}.backup_${Date.now()}.json`;
        try {
          await fs.promises.copyFile(this.filePath, backupPath);
          logger.warn(`File corrupt dibackup ke: ${backupPath}`);
        } catch {
          // ignore
        }
        await this.flush();
      }
    } else {
      await this.flush();
      logger.info(`Database JSON baru diinisialisasi di: ${this.filePath}`);
    }
  }

  getData() {
    return this.data;
  }

  setData(data) {
    this.data = data;
    this.scheduleSave();
  }

  scheduleSave(delay = 500) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flush().catch((err) => {
        logger.error('Error saat menyimpan database JSON:', err);
      });
    }, delay);
  }

  async flush() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    try {
      const tempPath = `${this.filePath}.tmp`;
      const jsonString = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(tempPath, jsonString, 'utf-8');
      await fs.promises.rename(tempPath, this.filePath);
    } catch (err) {
      logger.error('Fatal: Gagal flush database ke disk:', err);
    } finally {
      this.isSaving = false;
    }
  }
}

export default JsonAdapter;
