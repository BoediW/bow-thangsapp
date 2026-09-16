export default {
  name: 'setname',
  aliases: ['setsubject', 'gantinama'],
  category: 'group',
  description: 'Mengubah nama/subjek grup',
  usage: '<nama_baru_grup>',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, text, reply }) {
    if (!text) {
      return await reply('Masukkan nama baru untuk grup!\nContoh: *!setname Komunitas Developer*');
    }

    if (text.length > 100) {
      return await reply('❌ Nama grup maksimal 100 karakter.');
    }

    try {
      await sock.groupUpdateSubject(msg.key.remoteJid, text);
      await reply(`✅ Nama grup berhasil diubah menjadi: *${text}*`);
    } catch (err) {
      throw err;
    }
  }
};
