import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'demote',
  aliases: ['unadmin', 'turunkan'],
  category: 'group',
  description: 'Menurunkan jabatan Admin Grup menjadi anggota biasa',
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
      return await reply('Tag (@user) atau balas pesan admin yang ingin diturunkan jabatannya.');
    }

    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'demote');
      await reply(`✅ Jabatan Admin @${cleanJid(targetJid)} telah diturunkan menjadi anggota biasa.`, {
        mentions: [targetJid]
      });
    } catch (err) {
      throw err;
    }
  }
};
