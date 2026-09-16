import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import db from '../database/database.js';
import tempManager from '../utils/tempManager.js';
import handleIncomingMessage from './messageHandler.js';

let sock = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Initialize and start the WhatsApp Baileys connection
 */
export async function startWhatsAppConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionsDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  logger.info(`Menggunakan Baileys v${version.join('.')}, versi terbaru: ${isLatest}`);

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: [config.botName, 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
    syncFullHistory: false
  });

  // Handle Credentials Save
  sock.ev.on('creds.update', saveCreds);

  // Handle Connection Update (QR, Connected, Disconnected)
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n');
      logger.info('Silakan pindai (scan) kode QR berikut di aplikasi WhatsApp:');
      qrcode.generate(qr, { small: true });
      console.log('\n');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode
        : lastDisconnect?.error?.code;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn(`Koneksi terputus dengan status code: ${statusCode}. Alasan: ${lastDisconnect?.error?.message || 'Unknown'}`);

      if (statusCode === DisconnectReason.loggedOut) {
        logger.error('Perangkat keluar (Logged Out). Silakan hapus folder sessions dan scan ulang.');
      } else if (shouldReconnect) {
        reconnectAttempts++;
        if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(reconnectAttempts * 3000, 30000);
          logger.info(`Mencoba menyambungkan kembali dalam ${delay / 1000} detik (Percobaan ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(startWhatsAppConnection, delay);
        } else {
          logger.error('Maksimal percobaan reconnect tercapai. Harap periksa jaringan atau restart manual.');
        }
      }
    } else if (connection === 'open') {
      reconnectAttempts = 0;
      logger.success(`🎉 Bot ${config.botName} BERHASIL TERHUBUNG ke WhatsApp!`);
      logger.info(`Nomor Bot: ${sock.user?.id ? sock.user.id.split(':')[0] : 'Unknown'}`);
      logger.info(`Prefix aktif: "${db.getPrefix()}"`);
    }
  });

  // Handle Incoming Messages
  sock.ev.on('messages.upsert', async (m) => {
    await handleIncomingMessage(sock, m);
  });

  return sock;
}

/**
 * Setup graceful process termination
 */
export function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.warn(`\nMenerima sinyal ${signal}. Menutup bot dengan aman...`);

    try {
      if (sock) {
        sock.end(new Error(`Shutdown by ${signal}`));
      }
      await db.close();
      await tempManager.purgeOldFiles(0);
      logger.success('Database tersimpan & temporary files dibersihkan.');
    } catch (err) {
      logger.error('Error saat proses shutdown:', err);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
}

export default {
  startWhatsAppConnection,
  setupGracefulShutdown
};
