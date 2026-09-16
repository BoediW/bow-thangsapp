import config from '../../config/config.js';
import { formatRuntime, buildMenuText } from '../../utils/formatter.js';

export default {
  name: 'menu',
  aliases: ['helpall', 'allmenu', 'commands'],
  category: 'general',
  description: 'Menampilkan seluruh daftar menu perintah bot',
  usage: '',
  cooldown: 5,
  async execute({ msg, prefix, commandRegistry, reply }) {
    const pushName = msg.pushName || 'Sahabat';
    const uptime = formatRuntime(Date.now() - config.startTime);

    // Group commands by category (filter out hidden or disabled commands like eval/exec if disabled)
    const categories = {
      general: [],
      sticker: [],
      media: [],
      downloader: [],
      fun: [],
      group: [],
      owner: []
    };

    const added = new Set();
    for (const [name, cmd] of commandRegistry.entries()) {
      if (added.has(cmd.name)) continue;
      added.add(cmd.name);

      if (cmd.name === 'eval' || cmd.name === 'exec') {
        if (!config.enableEvalExec) continue;
      }

      const cat = (cmd.category || 'general').toLowerCase();
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(cmd);
    }

    const menuText = buildMenuText({
      botName: config.botName,
      userName: pushName,
      prefix,
      runtime: uptime,
      categories
    });

    await reply(menuText);
  }
};
