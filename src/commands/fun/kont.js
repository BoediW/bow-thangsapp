import { cleanJid } from '../../utils/formatter.js';

export default {
  name: 'kont',
  aliases: [],
  category: 'fun',
  description: 'Gacha mention member grup secara random',
  usage: '',
  cooldown: 5,
  groupOnly: true,
  async execute({ groupMetadata, reply }) {
    const participants = groupMetadata?.participants || [];
    
    if (participants.length === 0) {
      return await reply('Brisik kontol');
    }
    
    const randomMember = participants[Math.floor(Math.random() * participants.length)];
    const jid = randomMember.id;
    
    await reply(`Brisik kontol @${cleanJid(jid)}`, { mentions: [jid] });
  }
};
