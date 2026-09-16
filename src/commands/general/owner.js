import config from '../../config/config.js';

export default {
  name: 'owner',
  aliases: ['creator', 'developer'],
  category: 'general',
  description: 'Mendapatkan kontak pemilik bot',
  usage: '',
  cooldown: 5,
  async execute({ sock, msg, reply }) {
    const ownerNumber = config.rawOwnerNumber;
    const cleanNumber = ownerNumber.replace(/[^0-9]/g, '');

    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:Owner ${config.botName}\n` +
      `ORG:${config.botName};\n` +
      `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\n` +
      'END:VCARD';

    await sock.sendMessage(
      msg.key.remoteJid,
      {
        contacts: {
          displayName: `Owner ${config.botName}`,
          contacts: [{ vcard }]
        }
      },
      { quoted: msg }
    );
  }
};
