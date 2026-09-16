import util from 'util';
import config from '../../config/config.js';

export default {
  name: 'eval',
  aliases: ['>'],
  category: 'owner',
  description: 'Mengevaluasi kode JavaScript (Hanya Owner & Terkunci)',
  usage: '<kode_javascript>',
  cooldown: 5,
  ownerOnly: true,
  async execute({ sock, msg, text, reply, args, isGroup, sender, prefix, groupMetadata }) {
    if (!config.enableEvalExec) {
      return await reply('⚠️ Perintah *eval* dinonaktifkan demi keamanan sistem.\n\nUntuk mengaktifkannya, ubah nilai `ENABLE_EVAL_EXEC=true` pada file `.env`.');
    }

    if (!text) {
      return await reply('Masukkan ekspresi JavaScript yang ingin dievaluasi.');
    }

    try {
      let evaled = await eval(text);
      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled, { depth: 1 });
      }
      await reply(`✅ *Eval Output:*\n\`\`\`javascript\n${evaled}\n\`\`\``);
    } catch (err) {
      await reply(`❌ *Eval Error:*\n\`\`\`javascript\n${err.message}\n\`\`\``);
    }
  }
};
