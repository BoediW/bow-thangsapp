const DARES = [
  'Kirim voice note bernyanyi lagu anak-anak selama 15 detik ke grup ini!',
  'Ganti foto profil WhatsApp kamu dengan foto meme konyol selama 1 jam!',
  'Kirim pesan "Aku kangen kamu..." ke chat teratas di kontakmu lalu screenshot reaksinya!',
  'Ketik pesan menggunakan hidung kamu dan kirim ke grup!',
  'Tulis status WhatsApp: "Lagi butuh uang cepat, ada yang mau pinjemin?" selama 10 menit!',
  'Katakan hal paling jujur tentang salah satu admin di grup ini!',
  'Kirim stiker terlucu atau teraneh yang ada di koleksimu sekarang!'
];

export default {
  name: 'dare',
  aliases: ['tantangan'],
  category: 'fun',
  description: 'Tantangan aksi seru untuk game Truth or Dare',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    const d = DARES[Math.floor(Math.random() * DARES.length)];
    await reply(`🔥 *DARE:*\n\n"${d}"\n\n_Lakukan sekarang atau dapat hukuman!_`);
  }
};
