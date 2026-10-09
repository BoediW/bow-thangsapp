import db from '../../database/database.js';

export default {
  name: 'balance',
  aliases: ['bal', 'dompet', 'saldo', 'money'],
  category: 'fun',
  description: 'Mengecek jumlah saldo / uang casino Anda',
  usage: '',
  cooldown: 2,
  async execute({ sender, reply, pushName, prefix }) {
    const user = db.getUser(sender);
    const name = pushName || 'User';

    await reply(
      `💳 *DOMPET CASINO* 💳\n\n` +
      `👤 Pemilik: *${name}*\n` +
      `💰 Saldo: *$${user.balance.toLocaleString('id-ID')}*\n\n` +
      `💡 _Ketik \`${prefix}daily\` untuk klaim saldo harian gratis!_\n` +
      `🎰 _Ketik \`${prefix}roulette\` untuk main roulette!_`
    );
  }
};
