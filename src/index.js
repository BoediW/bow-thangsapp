import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import logger from './utils/logger.js';
import db from './database/database.js';
import tempManager from './utils/tempManager.js';
import commandHandler from './handlers/commandHandler.js';
import { startWhatsAppConnection, setupGracefulShutdown } from './handlers/connectionHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  console.clear();
  console.log(`
======================================================
  🤖 ${config.botName.toUpperCase()} - MULTIFUNCTION WHATSAPP BOT
  ⚡ Node.js ${process.version} | Platform: ${process.platform}
  🛡️  Owner: ${config.rawOwnerNumber} | Prefix: ${config.defaultPrefix}
======================================================
  `);

  logger.info('Menginisialisasi sistem bot...');

  // 1. Inisialisasi Database
  await db.init();

  // 2. Bersihkan file temporary lama
  await tempManager.purgeOldFiles();
  // Jalankan pembersihan berkala setiap 10 menit
  setInterval(() => {
    tempManager.purgeOldFiles();
  }, 10 * 60 * 1000);

  // 3. Muat seluruh perintah
  const commandsDir = path.join(__dirname, 'commands');
  await commandHandler.loadCommands(commandsDir);

  // 4. Setup graceful shutdown handlers
  setupGracefulShutdown();

  // 5. Hubungkan ke WhatsApp Socket
  logger.info('Menghubungkan ke server WhatsApp Web...');
  await startWhatsAppConnection();
}

bootstrap().catch((err) => {
  logger.error('Fatal error saat bootstrap bot:', err);
  process.exit(1);
});
