const TRUTHS = [
  'Apa rahasia terbesar yang belum pernah kamu ceritakan ke siapapun?',
  'Kapan terakhir kali kamu menangis dan apa alasannya?',
  'Siapa orang di grup ini yang diam-diam kamu kagumi?',
  'Apa hal paling memalukan yang pernah terjadi dalam hidupmu?',
  'Jika kamu bisa kembali ke masa lalu, kesalahan apa yang ingin kamu ubah?',
  'Pernahkah kamu pura-pura sakit demi bolos sekolah atau kerja?',
  'Apa kebohongan terbesar yang pernah kamu ucapkan kepada orang tua?',
  'Siapa mantan yang paling susah kamu lupakan?'
];

export default {
  name: 'truth',
  aliases: ['kejujuran'],
  category: 'fun',
  description: 'Tantangan kejujuran untuk game Truth or Dare',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    await reply(`🤔 *TRUTH:*\n\n"${q}"\n\n_Jawab dengan jujur ya!_`);
  }
};
