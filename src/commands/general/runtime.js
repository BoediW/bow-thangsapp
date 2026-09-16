import config from '../../config/config.js';
import { formatRuntime } from '../../utils/formatter.js';

export default {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'general',
  description: 'Melihat masa aktif bot sejak dinyalakan',
  usage: '',
  cooldown: 3,
  async execute({ reply }) {
    const uptime = Date.now() - config.startTime;
    await reply(`⏱ Bot telah aktif selama: *${formatRuntime(uptime)}*`);
  }
};
