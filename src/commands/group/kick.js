import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'kick',
  aliases: ['tendang', 'remove'],
  category: 'group',
  description: 'Mengeluarkan anggota dari grup',
  usage: '@user [atau reply pesan user]',
  cooldown: 5,
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute({ sock, msg, botJid, reply }) {
    let targetJid;

    if (msg.quoted) {
      targetJid = msg.quoted.sender;
    } else if (msg.mentionedJid && msg.mentionedJid.length > 0) {
      targetJid = msg.mentionedJid[0];
    }

    if (!targetJid) {
      return await reply('Tag (@user) atau balas pesan user yang ingin dikeluarkan dari grup.');
    }

    if (targetJid === botJid) {
      return await reply('❌ Bot tidak bisa mengeluarkan diri sendiri dari grup.');
    }

    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'remove');
      await reply(`✅ Berhasil mengeluarkan @${cleanJid(targetJid)} dari grup.`, {
        mentions: [targetJid]
      });
    } catch (err) {
      throw err;
    }
  }
};
