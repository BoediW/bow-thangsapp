import { exec } from 'child_process';
import util from 'util';
import config from '../../config/config.js';

const execPromise = util.promisify(exec);

export default {
  name: 'exec',
  aliases: ['$', 'sh', 'shell'],
  category: 'owner',
  description: 'Mengeksekusi perintah shell terminal (Hanya Owner & Terkunci)',
  usage: '<command_shell>',
  cooldown: 5,
  ownerOnly: true,
  async execute({ text, reply }) {
    if (!config.enableEvalExec) {
      return await reply('⚠️ Perintah *exec/shell* dinonaktifkan demi keamanan sistem.\n\nUntuk mengaktifkannya, ubah nilai `ENABLE_EVAL_EXEC=true` pada file `.env`.');
    }

    if (!text) {
      return await reply('Masukkan perintah shell yang ingin dijalankan.');
    }

    try {
      const { stdout, stderr } = await execPromise(text, { timeout: 30000 });
      let output = stdout || stderr || 'Berhasil dijalankan tanpa output.';
      if (output.length > 2000) {
        output = output.substring(0, 2000) + '\n... (output terpotong)';
      }
      await reply(`💻 *Shell Output:*\n\`\`\`bash\n${output.trim()}\n\`\`\``);
    } catch (err) {
      await reply(`❌ *Shell Error:*\n\`\`\`bash\n${err.message}\n\`\`\``);
    }
  }
};
