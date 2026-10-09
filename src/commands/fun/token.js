import db from '../../database/database.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default {
  name: 'token',
  aliases: ['claimtoken', 'tokenharian'],
  category: 'fun',
  description: 'Klaim token gacha harian gratis',
  usage: '',
  cooldown: 3,
  async execute({ sender, reply, prefix }) {
    const user = db.getUser(sender);
    const now = Date.now();
    const lastClaim = user.lastTokenClaim || 0;

    if (now - lastClaim < DAY_IN_MS) {
      const remainingMs = DAY_IN_MS - (now - lastClaim);
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return await reply(`⏳ Kamu sudah mengklaim token harian!\nTunggu *${hours} jam ${minutes} menit* lagi.`);
    }

    const addedTokens = 5;
    const newTokens = (user.gachaTokens || 0) + addedTokens;

    db.updateUser(sender, {
      gachaTokens: newTokens,
      lastTokenClaim: now
    });

    await reply(
      `🪙 *BONUS TOKEN HARIAN!* 🪙\n\n` +
      `Berhasil mengklaim *+${addedTokens} Token Gacha*!\n` +
      `🎫 Total Token Kamu: *${newTokens} Token*\n\n` +
      `🎰 _Gunakan tokenmu untuk gacha ras dengan \`${prefix}gacha\`!_`
    );
  }
};
