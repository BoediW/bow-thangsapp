import db from '../../database/database.js';

export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Mengirim pesan siaran ke semua grup atau kontak terdaftar',
  usage: '<pesan_broadcast>',
  cooldown: 15,
  ownerOnly: true,
  async execute({ sock, msg, text, reply }) {
    if (!text && !msg.quoted) {
      return await reply('Masukkan pesan yang ingin disiarkan!\nContoh: *!broadcast Pemberitahuan pemeliharaan server.*');
    }

    const broadcastMessage = `📢 *「 SIARAN RESMI BOT 」*\n\n${text || msg.quoted.text || ''}\n\n_— Broadcast dari Owner_`;
    const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
    const groupJids = Object.keys(groups);

    if (groupJids.length === 0) {
      return await reply('❌ Bot belum bergabung ke dalam grup manapun.');
    }

    await reply(`⏳ Mengirim broadcast ke ${groupJids.length} grup...`);

    let successCount = 0;
    for (const jid of groupJids) {
      try {
        await sock.sendMessage(jid, { text: broadcastMessage });
        successCount++;
        // Slight delay to prevent rate limit
        await new Promise((r) => setTimeout(r, 1000));
      } catch {
        // continue
      }
    }

    await reply(`✅ Broadcast selesai! Berhasil terkirim ke *${successCount}/${groupJids.length}* grup.`);
  }
};
