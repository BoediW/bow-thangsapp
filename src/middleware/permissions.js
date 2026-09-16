import config from '../config/config.js';
import db from '../database/database.js';

export const permissions = {
  /**
   * Check if JID is one of the owners
   * @param {string} jid
   * @returns {boolean}
   */
  isOwner(jid) {
    if (!jid) return false;
    const cleanNumber = jid.split('@')[0].split(':')[0];
    return config.ownerNumbers.some((ownerJid) => {
      const ownerNumber = ownerJid.split('@')[0].split(':')[0];
      return ownerNumber === cleanNumber;
    });
  },

  /**
   * Check if chat JID is a group
   * @param {string} jid
   * @returns {boolean}
   */
  isGroup(jid) {
    return !!jid && jid.endsWith('@g.us');
  },

  /**
   * Check if participant is admin in group
   * @param {object} groupMetadata
   * @param {string} participantJid
   * @returns {boolean}
   */
  isAdmin(groupMetadata, participantJid) {
    if (!groupMetadata || !groupMetadata.participants) return false;
    const cleanTarget = participantJid.split('@')[0].split(':')[0];
    const participant = groupMetadata.participants.find((p) => {
      const pNum = p.id.split('@')[0].split(':')[0];
      return pNum === cleanTarget;
    });
    return !!(participant && (participant.admin === 'admin' || participant.admin === 'superadmin'));
  },

  /**
   * Check if bot itself is admin in group
   * @param {object} groupMetadata
   * @param {string} botJid
   * @returns {boolean}
   */
  isBotAdmin(groupMetadata, botJid) {
    return this.isAdmin(groupMetadata, botJid);
  },

  /**
   * Check if user is banned
   * @param {string} jid
   * @returns {boolean}
   */
  isBanned(jid) {
    return db.isBanned(jid);
  },

  /**
   * Validate command requirements against context
   * @param {object} cmd
   * @param {object} ctx
   * @returns {{ allowed: boolean, reason?: string }}
   */
  validate(cmd, ctx) {
    const { sender, isGroup, groupMetadata, botJid } = ctx;

    // Check ban
    if (this.isBanned(sender)) {
      return { allowed: false, reason: 'Maaf, nomor Anda telah diblokir dari penggunaan bot ini.' };
    }

    // Owner check
    if (cmd.ownerOnly && !this.isOwner(sender)) {
      return { allowed: false, reason: 'Perintah ini hanya dapat digunakan oleh Owner bot.' };
    }

    // Group check
    if (cmd.groupOnly && !isGroup) {
      return { allowed: false, reason: 'Perintah ini hanya dapat digunakan di dalam Grup WhatsApp.' };
    }

    // Admin check
    if (cmd.adminOnly) {
      if (!isGroup) {
        return { allowed: false, reason: 'Perintah ini hanya dapat digunakan di dalam Grup WhatsApp.' };
      }
      const senderIsAdmin = this.isAdmin(groupMetadata, sender) || this.isOwner(sender);
      if (!senderIsAdmin) {
        return { allowed: false, reason: 'Perintah ini hanya dapat digunakan oleh Admin Grup.' };
      }
    }

    // Bot Admin check
    if (cmd.botAdminOnly) {
      if (!isGroup) {
        return { allowed: false, reason: 'Perintah ini hanya dapat digunakan di dalam Grup WhatsApp.' };
      }
      const botIsAdmin = this.isBotAdmin(groupMetadata, botJid);
      if (!botIsAdmin) {
        return { allowed: false, reason: 'Bot harus menjadi Admin Grup untuk menjalankan perintah ini.' };
      }
    }

    return { allowed: true };
  }
};

export default permissions;
