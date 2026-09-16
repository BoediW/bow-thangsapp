export default {
  name: 'hidetag',
  aliases: ['ht', 'announce'],
  category: 'group',
  description: 'Mengirim pesan siaran tersembunyi ke semua anggota grup',
  usage: '<pesan pengumuman>',
  cooldown: 8,
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, text, groupMetadata, reply }) {
    if (!text) {
      return await reply('Tuliskan pesan yang ingin di-hidetag!\nContoh: *!hidetag Jangan lupa meeting malam ini.*');
    }

    const participants = groupMetadata.participants || [];
    const mentions = participants.map((p) => p.id);

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        text,
        mentions
      }
    );
  }
};
