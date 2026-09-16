export default {
  name: 'setdesc',
  aliases: ['setdeskripsi', 'gantideskripsi'],
  category: 'group',
  description: 'Mengubah deskripsi grup',
  usage: '<deskripsi_baru>',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Masukkan deskripsi baru untuk grup!\nContoh: *!setdesc Selamat datang di grup resmi kami!*');
    }

    try {
      await sock.groupUpdateDescription(msg.key.remoteJid, text);
      await reply('✅ Deskripsi grup berhasil diperbarui.');
    } catch (err) {
      throw err;
    }
  }
};
