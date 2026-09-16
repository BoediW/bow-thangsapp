import process from 'process';
import config from '../../config/config.js';
import db from '../../database/database.js';
import { formatRuntime, formatBytes } from '../../utils/formatter.js';

export default {
  name: 'info',
  aliases: ['botinfo'],
  category: 'general',
  description: 'Melihat informasi spesifikasi sistem bot',
  usage: '',
  cooldown: 5,
  async execute({ reply }) {
    const memory = process.memoryUsage();
    const stats = db.getStats();
    const uptime = formatRuntime(Date.now() - config.startTime);

    const infoText = `╭───「 *INFORMASI BOT* 」───
│
│ 🤖 *Nama Bot* : ${config.botName}
│ ⏱ *Uptime* : ${uptime}
│ 📊 *Total Perintah Dijalankan* : ${stats.commandsExecuted || 0}
│ 💾 *Penggunaan RAM* : ${formatBytes(memory.rss)} / ${formatBytes(memory.heapUsed)}
│ ⚙️ *Platform* : ${process.platform} (Node.js ${process.version})
│ 📁 *Max File Size* : ${config.maxFileSizeMB} MB
│ 🛡️ *Environment* : ${config.nodeEnv}
│
╰──────────────────────────`;

    await reply(infoText);
  }
};
