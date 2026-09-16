export default {
  name: 'help',
  aliases: ['bantuan'],
  category: 'general',
  description: 'Melihat detail penggunaan suatu perintah',
  usage: '<nama_command>',
  cooldown: 3,
  async execute({ args, prefix, commandRegistry, reply }) {
    if (!args[0]) {
      return await reply(`Ketik *${prefix}menu* untuk melihat seluruh daftar menu.\nAtau ketik *${prefix}help <command>* untuk melihat bantuan detail command.`);
    }

    const query = args[0].toLowerCase().replace(prefix, '');
    const cmd = commandRegistry.get(query);

    if (!cmd) {
      return await reply(`❌ Perintah *${query}* tidak ditemukan.`);
    }

    let text = `╭───「 BANTUAN: ${cmd.name.toUpperCase()} 」───\n`;
    text += `│\n`;
    text += `│ 📝 Deskripsi : ${cmd.description || '-'}\n`;
    text += `│ 🏷 Kategori  : ${cmd.category || 'general'}\n`;
    text += `│ 📌 Contoh    : ${prefix}${cmd.name} ${cmd.usage || ''}\n`;
    if (cmd.aliases && cmd.aliases.length > 0) {
      text += `│ 🔀 Alias     : ${cmd.aliases.map((a) => prefix + a).join(', ')}\n`;
    }
    text += `│ ⏱ Cooldown  : ${cmd.cooldown || 3} detik\n`;
    text += `│\n`;
    text += `╰───────────────────────`;

    await reply(text);
  }
};
