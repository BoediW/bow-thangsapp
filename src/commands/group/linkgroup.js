export default {
  name: 'linkgroup',
  aliases: ['linkgc', 'grouplink'],
  category: 'group',
  description: 'Mendapatkan link undangan grup WhatsApp',
  usage: '',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, reply }) {
    try {
      const code = await sock.groupInviteCode(msg.key.remoteJid);
      await reply(`🔗 *Link Grup:* https://chat.whatsapp.com/${code}`);
    } catch (err) {
      throw err;
    }
  }
};
