import axios from 'axios';

const LOCAL_QUOTES = [
  { text: 'Jangan biarkan hari kemarin merenggut terlalu banyak hari ini.', author: 'Will Rogers' },
  { text: 'Satu-satunya cara untuk melakukan pekerjaan hebat adalah mencintai apa yang Anda lakukan.', author: 'Steve Jobs' },
  { text: 'Hidup adalah apa yang terjadi ketika Anda sibuk membuat rencana lain.', author: 'John Lennon' },
  { text: 'Keberhasilan biasanya datang kepada mereka yang terlalu sibuk untuk mencarinya.', author: 'Henry David Thoreau' },
  { text: 'Masa depan adalah milik mereka yang percaya pada keindahan impian mereka.', author: 'Eleanor Roosevelt' },
  { text: 'Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda dapat mengubah dunia.', author: 'Nelson Mandela' }
];

export default {
  name: 'quote',
  aliases: ['quotes', 'katabijak', 'kata'],
  category: 'fun',
  description: 'Mendapatkan kutipan inspiratif dan kata-kata bijak',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    try {
      // Try public quotes API
      const res = await axios.get('https://api.quotable.io/random', { timeout: 3000 }).catch(() => null);
      if (res && res.data && res.data.content) {
        return await reply(`💬 *"${res.data.content}"*\n\n— _${res.data.author}_`);
      }
    } catch {
      // fallback
    }

    const random = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
    await reply(`💬 *"${random.text}"*\n\n— _${random.author}_`);
  }
};
