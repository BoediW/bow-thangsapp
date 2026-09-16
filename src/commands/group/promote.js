import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'promote',
  aliases: ['admin', 'jadiadmin'],
  category: 'group',
  description: 'Menaikkan jabatan anggota menjadi Admin Grup',
  usage: '@user [atau reply pesan user]',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, reply }) {
    let targetJid;

    if (msg.quoted) {
      targetJid = msg.quoted.sender;
    } else if (msg.mentionedJid && msg.mentionedJid.length > 0) {
      targetJid = msg.mentionedJid[0];
    }

    if (!targetJid) {
      return await reply('Tag (@user) atau balas pesan anggota yang ingin dijadikan admin.');
    }

    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'promote');
      await reply(`🎉 Selamat, @${cleanJid(targetJid)} sekarang menjadi Admin Grup!`, {
        mentions: [targetJid]
      });
    } catch (err) {
      throw err;
    }
  }
};
