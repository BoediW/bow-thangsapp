const JOKES = [
  'Kenapa ayam kalau berkokok matanya merem? Karena udah hafal teksnya.',
  'Ban apa yang ada di atas pohon? Ban-teng lompat.',
  'Kenapa air laut rasanya asin? Karena ikannya pada keringetan dikejar hiu.',
  'Hewan apa yang paling hening? Semut. Mana pernah semut teriak-teriak!',
  'Benda apa yang kalau dibeli selalu diinjak-injak? Keset.',
  'Pohon apa yang paling banyak muncul pas lebaran? Pohon maaf lahir dan batin.',
  'Kenapa zombie kalau nyerang bareng-bareng? Karena kalau sendirian namanya zomblo.',
  'Gelas apa yang bisa terbang? Gelasipter.'
];

export default {
  name: 'joke',
  aliases: ['lelucon', 'canda'],
  category: 'fun',
  description: 'Mendapatkan lelucon atau tebak-tebakan lucu',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    await reply(`😂 *Joke of the day:*\n\n${joke}`);
  }
};
