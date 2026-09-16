const RESPONSES = [
  'Sudah pasti ya.',
  'Tentu saja, sangat mungkin!',
  'Tanda-tandanya mengarah ke ya.',
  'Kemungkinan besar benar.',
  'Jawaban masih berkabut, coba tanyakan lagi nanti.',
  'Sebaiknya saya tidak memberitahumu sekarang.',
  'Konsentrasi dan tanyakan sekali lagi.',
  'Jangan terlalu berharap banyak.',
  'Jawaban saya adalah tidak.',
  'Sangat meragukan.'
];

export default {
  name: '8ball',
  aliases: ['magic8', 'bola8'],
  category: 'fun',
  description: 'Mendapatkan ramalan magis dari Magic 8-Ball',
  usage: '<pertanyaan>',
  cooldown: 3,
  async execute({ text, reply }) {
    if (!text) {
      return await reply('Tanyakan sesuatu kepada bola ajaib 8-Ball!\nContoh: *!8ball apakah dia menyukaiku?*');
    }

    const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    await reply(`🎱 *Magic 8-Ball:*\n\n❓ Pertanyaan: _${text}_\n🔮 Jawaban: *${answer}*`);
  }
};
