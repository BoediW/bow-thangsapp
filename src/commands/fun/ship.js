import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'ship',
  aliases: ['jodoh', 'match'],
  category: 'fun',
  description: 'Mengecek tingkat kecocokan asmara antara dua pengguna',
  usage: '@user [atau tag 2 user]',
  cooldown: 4,
  async execute({ msg, sender, reply }) {
    const mentions = msg.mentionedJid || [];
    let user1 = sender;
    let user2 = mentions[0];

    if (mentions.length >= 2) {
      user1 = mentions[0];
      user2 = mentions[1];
    } else if (!user2) {
      return await reply('Tag seseorang yang ingin kamu jodohkan!\nContoh: *!ship @user*');
    }

    // Deterministic pseudo-random based on user IDs
    const combined = [user1, user2].sort().join('');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash * 31 + combined.charCodeAt(i)) % 101;
    }
    const percent = Math.abs(hash);

    let comment = 'Bagaikan air dan minyak, susah nyatu 💔';
    if (percent > 85) comment = 'Pasangan idaman sedunia, segera ke pelaminan! 💍❤️';
    else if (percent > 65) comment = 'Cocok banget, tinggal tunggu waktu yang tepat! ✨';
    else if (percent > 45) comment = 'Lumayan cocok, asal saling mengalah dan pengertian. 😊';
    else if (percent > 25) comment = 'Cukup ada chemistry, tapi butuh banyak usaha. 🤔';

    const barLength = 10;
    const filled = Math.round((percent / 100) * barLength);
    const bar = '💖'.repeat(filled) + '🖤'.repeat(barLength - filled);

    const text = `╭───「 *LOVE METER* 」───\n` +
      `│ 👤 @${cleanJid(user1)}\n` +
      `│ 💘 @${cleanJid(user2)}\n` +
      `│\n` +
      `│ [${bar}] ${percent}%\n` +
      `│ 💌 *Status:* ${comment}\n` +
      `╰───────────────────────`;

    await reply(text, { mentions: [user1, user2] });
  }
};
