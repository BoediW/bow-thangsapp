const FACTS = [
  'Madu murni adalah satu-satunya makanan yang tidak akan pernah basi atau membusuk.',
  'Gurita memiliki tiga jantung dan sembilan otak.',
  'Pisang secara botani tergolong dalam keluarga buah beri, sedangkan stroberi bukan beri.',
  'Sidik jari koala sangat mirip dengan sidik jari manusia sampai-sampai bisa membingungkan investigasi polisi.',
  'Venus adalah satu-satunya planet di tata surya kita yang berputar searah jarum jam.',
  'Jantung paus biru berukuran sebesar mobil kecil dan detaknya bisa terdengar dari jarak 3 kilometer.',
  'Menara Eiffel bisa menjadi 15 cm lebih tinggi selama musim panas karena pemuaian termal besi.'
];

export default {
  name: 'fact',
  aliases: ['fakta', 'faktaunik'],
  category: 'fun',
  description: 'Menampilkan fakta unik dan menarik di dunia',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    await reply(`💡 *Tahukah Kamu?*\n\n${fact}`);
  }
};
