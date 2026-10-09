import db from '../../database/database.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default {
  name: 'daily',
  aliases: ['harian', 'klaim'],
  category: 'fun',
  description: 'Klaim bonus saldo harian gratis',
  usage: '',
  cooldown: 3,
  async execute({ sender, reply, prefix }) {
    const user = db.getUser(sender);
    const now = Date.now();
    const lastClaim = user.lastDaily || 0;

    if (now - lastClaim < DAY_IN_MS) {
      const remainingMs = DAY_IN_MS - (now - lastClaim);
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return await reply(`⏳ Anda sudah mengambil bonus harian! Tunggu *${hours} jam ${minutes} menit* lagi.`);
    }

    const reward = Math.floor(Math.random() * 1001) + 500; // 500 - 1500
    const newBalance = (user.balance || 0) + reward;

    db.updateUser(sender, {
      balance: newBalance,
      lastDaily: now
    });

    await reply(
      `🎁 *BONUS HARIAN KLAIMED!* 🎁\n\n` +
      `Anda mendapatkan bonus harian sebesar *$${reward.toLocaleString('id-ID')}*!\n` +
      `💰 Saldo Anda sekarang: *$${newBalance.toLocaleString('id-ID')}*\n\n` +
      `🎰 _Mainkan saldo Anda di \`${prefix}roulette\`!_`
    );
  }
};
