export default {
  name: 'setstatus',
  aliases: ['setbio'],
  category: 'owner',
  description: 'Mengubah status deskripsi profil (Bio) WhatsApp bot',
  usage: '<status_baru>',
  cooldown: 5,
  ownerOnly: true,
  async execute({ sock, text, reply }) {
    if (!text) {
      return await reply('Masukkan teks status/bio baru!\nContoh: *!setstatus Bot WhatsApp Aktif 24 Jam*');
    }

    try {
      await sock.updateProfileStatus(text);
      await reply(`✅ Status bio WhatsApp bot berhasil diubah menjadi:\n"${text}"`);
    } catch (err) {
      throw err;
    }
  }
};
