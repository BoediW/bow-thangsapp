import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(rootDir, '.env') });

function normalizeOwnerJids(rawOwnerNumbers) {
  if (!rawOwnerNumbers) return [];
  return rawOwnerNumbers
    .split(',')
    .map((num) => num.trim().replace(/[^0-9]/g, ''))
    .filter((num) => num.length > 0)
    .map((num) => `${num}@s.whatsapp.net`);
}

export const config = Object.freeze({
  rootDir,
  botName: process.env.BOT_NAME || 'MyWhatsAppBot',
  ownerNumbers: normalizeOwnerJids(process.env.OWNER_NUMBER || '6285173080632'),
  rawOwnerNumber: process.env.OWNER_NUMBER || '6285173080632',
  defaultPrefix: process.env.PREFIX || '!',
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE, 10) || 50,
  tempDir: path.resolve(rootDir, process.env.TEMP_DIR || './temp'),
  sessionsDir: path.resolve(rootDir, './sessions'),
  dataDir: path.resolve(rootDir, './data'),
  nodeEnv: process.env.NODE_ENV || 'development',
  cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS, 10) || 3,
  maxConcurrentMedia: parseInt(process.env.MAX_CONCURRENT_MEDIA, 10) || 3,
  ffmpegPath: process.env.FFMPEG_PATH || '',
  enableEvalExec: process.env.ENABLE_EVAL_EXEC === 'true',
  stickerPack: process.env.STICKER_PACK || 'WhatsApp Bot',
  stickerAuthor: process.env.STICKER_AUTHOR || 'Antigravity',
  startTime: Date.now()
});

export default config;
