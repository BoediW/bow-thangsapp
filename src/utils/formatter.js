/**
 * Format milliseconds into human-readable runtime string
 * @param {number} ms
 * @returns {string}
 */
export function formatRuntime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Format bytes into KB, MB, GB
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clean JID to phone number
 * @param {string} jid
 * @returns {string}
 */
export function cleanJid(jid) {
  if (!jid) return '';
  return jid.split('@')[0].split(':')[0];
}

/**
 * Build UI menu text according to user design
 * @param {object} params
 * @returns {string}
 */
export function buildMenuText({ botName, userName, prefix, runtime, categories }) {
  let text = `╭───「 ${botName.toUpperCase()} 」───╮\n`;
  text += `│\n`;
  text += `│ 👤 User : ${userName}\n`;
  text += `│ ⚡ Prefix : ${prefix}\n`;
  text += `│ ⏱ Runtime : ${runtime}\n`;
  text += `│\n`;

  for (const [category, commands] of Object.entries(categories)) {
    text += `├── ${category.toUpperCase()}\n`;
    for (const cmd of commands) {
      text += `│ • ${prefix}${cmd.name}${cmd.usage ? ` ${cmd.usage}` : ''}\n`;
    }
    text += `│\n`;
  }

  text += `└───────────────────────`;
  return text;
}

/**
 * Standard user-facing error response
 * @param {string} [customMessage]
 * @returns {string}
 */
export function buildErrorMessage(customMessage) {
  if (customMessage) {
    return `❌ ${customMessage}`;
  }
  return `❌ Terjadi kesalahan saat memproses permintaan.\n\nSilakan coba lagi beberapa saat.`;
}
