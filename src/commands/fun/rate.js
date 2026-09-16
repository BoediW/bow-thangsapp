export default {
  name: 'rate',
  aliases: ['nilai'],
  category: 'fun',
  description: 'Menilai sesuatu atau seseorang dari skala 0-100%',
  usage: '<sesuatu yang dinilai>',
  cooldown: 3,
  async execute({ text, reply }) {
    if (!text) {
      return await reply('Apa yang ingin kamu nilai?\nContoh: *!rate seberapa ganteng aku*');
    }

    const rate = Math.floor(Math.random() * 101);
    let comment = 'Biasa aja sih...';
    if (rate >= 90) comment = 'Luar biasa sempurna! 🌟';
    else if (rate >= 70) comment = 'Mantap dan keren! 👍';
    else if (rate >= 50) comment = 'Lumayan oke lah. 👌';
    else if (rate <= 20) comment = 'Waduh parah banget ini mah... 🗿';

    await reply(`📊 *Hasil Penilaian untuk:* "${text}"\n\nSkor: *${rate}%*\nKesan: _${comment}_`);
  }
};
