export default {
  name: 'ping',
  aliases: ['p', 'speed'],
  category: 'general',
  description: 'Mengecek kecepatan respon dan latensi bot',
  usage: '',
  cooldown: 3,
  async execute({ msg, reply }) {
    const start = Date.now();
    const sent = await reply('🏓 Pong!');
    const latency = Date.now() - start;
    if (sent) {
      await reply(`🏓 Pong!\n⚡ Kecepatan respon: *${latency} ms*`);
    }
  }
};
