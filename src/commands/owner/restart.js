import db from '../../database/database.js';
import tempManager from '../../utils/tempManager.js';
import logger from '../../utils/logger.js';

export default {
  name: 'restart',
  aliases: ['reboot'],
  category: 'owner',
  description: 'Memulai ulang (restart) proses bot secara aman',
  usage: '',
  cooldown: 10,
  ownerOnly: true,
  async execute({ reply }) {
    await reply('🔄 Sedang memulai ulang sistem bot secara graceful...');
    logger.info('Restart command dipicu oleh owner. Menyimpan database & membersihkan data temporary...');

    try {
      await db.close();
      await tempManager.purgeOldFiles(0);
    } catch {
      // ignore
    }

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};
