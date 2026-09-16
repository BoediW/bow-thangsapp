export default {
  name: 'random',
  aliases: ['acak', 'choose', 'pilih'],
  category: 'fun',
  description: 'Memilih pilihan acak atau melempar koin/angka',
  usage: '<pilihan1, pilihan2, ...> atau <min-max>',
  cooldown: 3,
  async execute({ text, reply }) {
    if (!text) {
      // Coin flip default
      const coin = Math.random() > 0.5 ? '🪙 GAMBAR' : '🪙 ANGKA';
      return await reply(`Hasil lempar koin: *${coin}*`);
    }

    // Number range check e.g. 1-100
    if (/^\d+\s*-\s*\d+$/.test(text.trim())) {
      const [minStr, maxStr] = text.split('-').map((s) => s.trim());
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      if (min < max) {
        const randNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return await reply(`🎲 Angka acak antara ${min} - ${max}: *${randNum}*`);
      }
    }

    // Choices separated by comma or 'atau'
    const choices = text.split(/,|\s+atau\s+/i).map((c) => c.trim()).filter(Boolean);
    if (choices.length > 1) {
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      return await reply(`🎯 Dari pilihan yang ada, bot memilih: *${chosen}*`);
    }

    await reply('Format pilihan:\n• *!random* (lempar koin)\n• *!random 1-100* (angka acak)\n• *!random nasi goreng, bakso, sate* (pilih acak)');
  }
};
