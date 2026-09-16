import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'tagall',
  aliases: ['everyone', 'semua'],
  category: 'group',
  description: 'Mention seluruh anggota grup dengan pesan kustom',
  usage: '[pesan tambahan]',
  cooldown: 10,
  groupOnly: true,
  adminOnly: true,
  async execute({ text, groupMetadata, reply }) {
    const participants = groupMetadata.participants || [];
    const message = text ? `📢 *PENGUMUMAN:* ${text}\n\n` : `📢 *TAG ALL PARTICIPANTS*\n\n`;

    let tagText = message;
    const mentions = [];

    for (const member of participants) {
      tagText += `• @${cleanJid(member.id)}\n`;
      mentions.push(member.id);
    }

    await reply(tagText, { mentions });
  }
};
