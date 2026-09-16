import path from 'path';
import { fileURLToPath } from 'url';
import commandHandler from '../src/handlers/commandHandler.js';
import db from '../src/database/database.js';
import cooldown from '../src/middleware/cooldown.js';
import rateLimiter from '../src/middleware/rateLimit.js';
import permissions from '../src/middleware/permissions.js';
import stickerHelper, { createExifBuffer, injectExif } from '../src/utils/sticker.js';
import { formatRuntime, formatBytes, buildMenuText } from '../src/utils/formatter.js';
import logger from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('\n--- Memulai Self-Test WhatsApp Bot ---\n');

  // Test 1: Load all commands
  const commandsDir = path.join(__dirname, '../src/commands');
  await commandHandler.loadCommands(commandsDir);

  const commandCount = commandHandler.commands.size;
  if (commandCount < 25) {
    throw new Error(`Jumlah command (${commandCount}) kurang dari ekspektasi.`);
  }
  logger.success(`[TEST 1 PASSED] Berhasil memverifikasi ${commandCount} command modular.`);

  // Test 2: Inisialisasi Database
  await db.init();
  const testJid = '6281111111111@s.whatsapp.net';
  const user = db.getUser(testJid);
  if (!user || user.jid !== testJid) {
    throw new Error('Database getUser gagal.');
  }
  db.updateUser(testJid, { name: 'Tester' });
  db.recordCommandUsage('menu', testJid);
  const updatedUser = db.getUser(testJid);
  if (updatedUser.commandsUsed < 1 || updatedUser.name !== 'Tester') {
    throw new Error('Database update / command usage gagal.');
  }
  logger.success('[TEST 2 PASSED] Database abstraction & operasional JSON berhasil.');

  // Test 3: Test Cooldown & Rate Limiting
  const dummyUser = '6289999999999@s.whatsapp.net';
  const check1 = cooldown.check(dummyUser, 'ping', 3);
  if (check1.inCooldown) throw new Error('Cooldown check 1 harusnya false.');
  cooldown.set(dummyUser, 'ping');
  const check2 = cooldown.check(dummyUser, 'ping', 3);
  if (!check2.inCooldown) throw new Error('Cooldown check 2 harusnya true.');
  logger.success('[TEST 3 PASSED] Cooldown middleware berfungsi sesuai spesifikasi.');

  // Test 4: Rate Limiter
  const spamUser = '6288888888888@s.whatsapp.net';
  for (let i = 0; i < 6; i++) {
    rateLimiter.isRateLimited(spamUser);
  }
  const isBlocked = rateLimiter.isRateLimited(spamUser);
  if (!isBlocked) throw new Error('RateLimiter harusnya memblokir request ke-7.');
  logger.success('[TEST 4 PASSED] Anti-spam rate limiter berhasil menahan spam.');

  // Test 5: Formatter & Menu Layout
  const sampleMenu = buildMenuText({
    botName: 'TestBot',
    userName: 'Tester',
    prefix: '!',
    runtime: formatRuntime(12345678),
    categories: {
      general: [{ name: 'menu', usage: '' }, { name: 'ping', usage: '' }]
    }
  });
  if (!sampleMenu.includes('╭───「 TESTBOT 」───╮') || !sampleMenu.includes('└───────────────────────')) {
    throw new Error('Format buildMenuText tidak sesuai spesifikasi layout.');
  }
  logger.success('[TEST 5 PASSED] Formatter & response box layout sesuai spesifikasi UI.');

  // Test 6: Sticker EXIF metadata builder
  const exifBuff = createExifBuffer('MyStickerPack', 'MyAuthor');
  if (!exifBuff || exifBuff.length === 0 || !exifBuff.toString('utf-8').includes('MyStickerPack')) {
    throw new Error('Sticker EXIF buffer creation gagal.');
  }
  logger.success('[TEST 6 PASSED] WebP EXIF sticker metadata buffer generator valid.');

  // Test 7: Direct Image to Sticker conversion using Sharp
  const samplePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const stickerBuff = await stickerHelper.createSticker(samplePng, { pack: 'TestPack', author: 'TestAuthor' });
  if (!stickerBuff || !stickerBuff.toString('utf-8', 0, 4).includes('RIFF') || !stickerBuff.toString('utf-8').includes('TestPack')) {
    throw new Error('Konversi stiker Sharp gagal atau metadata tidak tertanam.');
  }
  logger.success('[TEST 7 PASSED] Konversi gambar ke stiker WebP via Sharp + EXIF berhasil.');

  console.log('\n🎉 SEMUA TEST BERHASIL! Struktur bot siap dijalankan.\n');
  process.exit(0);
}

runTests().catch((err) => {
  logger.error('Test gagal:', err);
  process.exit(1);
});
