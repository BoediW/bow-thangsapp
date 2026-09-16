import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';
import db from '../database/database.js';
import commandHandler from './commandHandler.js';
import logger from '../utils/logger.js';

// Cache for group metadata to avoid spamming WhatsApp API
const groupMetadataCache = new Map();

/**
 * Unwrap nested messages (viewOnce, ephemeral, etc.)
 */
function unwrapMessage(msgObj) {
  let unwrapped = msgObj;
  while (
    unwrapped?.ephemeralMessage ||
    unwrapped?.viewOnceMessage ||
    unwrapped?.viewOnceMessageV2 ||
    unwrapped?.viewOnceMessageV2Extension ||
    unwrapped?.documentWithCaptionMessage
  ) {
    unwrapped =
      unwrapped.ephemeralMessage?.message ||
      unwrapped.viewOnceMessage?.message ||
      unwrapped.viewOnceMessageV2?.message ||
      unwrapped.viewOnceMessageV2Extension?.message ||
      unwrapped.documentWithCaptionMessage?.message;
  }
  return unwrapped;
}

/**
 * Serialize and process incoming Baileys messages
 * @param {object} sock Baileys socket
 * @param {object} m Raw message from Baileys
 */
export async function handleIncomingMessage(sock, m) {
  try {
    if (!m.messages || !m.messages[0]) return;
    const rawMsg = m.messages[0];

    // Ignore status broadcasts and messages sent without key or message content
    if (!rawMsg.message || rawMsg.key.remoteJid === 'status@broadcast') return;

    const jid = rawMsg.key.remoteJid;
    const isGroup = jid.endsWith('@g.us');
    const sender = isGroup ? rawMsg.key.participant : rawMsg.key.remoteJid;
    const pushName = rawMsg.pushName || 'User';
    const botJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : '';

    // Extract unwrapped message content
    const innerMessage = unwrapMessage(rawMsg.message);
    if (!innerMessage) return;

    const msgType = getContentType(innerMessage);
    const content = innerMessage[msgType];

    let body = '';
    if (msgType === 'conversation') {
      body = innerMessage.conversation;
    } else if (msgType === 'extendedTextMessage') {
      body = innerMessage.extendedTextMessage.text;
    } else if (msgType === 'imageMessage') {
      body = innerMessage.imageMessage.caption || '';
    } else if (msgType === 'videoMessage') {
      body = innerMessage.videoMessage.caption || '';
    } else if (msgType === 'documentMessage') {
      body = innerMessage.documentMessage.caption || '';
    }

    body = (body || '').trim();

    // Check prefix
    const prefix = db.getPrefix();
    if (!body.startsWith(prefix)) return;

    // Parse command and args
    const fullCommand = body.slice(prefix.length).trim();
    if (!fullCommand) return;

    const args = fullCommand.split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const text = args.join(' ');

    // Extract quoted message details
    const contextInfo = content?.contextInfo || innerMessage?.extendedTextMessage?.contextInfo;
    let quoted = null;

    if (contextInfo && contextInfo.quotedMessage) {
      const quotedInner = unwrapMessage(contextInfo.quotedMessage);
      const quotedType = getContentType(quotedInner);
      const quotedContent = quotedInner ? quotedInner[quotedType] : null;

      quoted = {
        key: {
          remoteJid: jid,
          fromMe: contextInfo.participant === botJid,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant
        },
        sender: contextInfo.participant,
        type: quotedType,
        message: quotedInner,
        content: quotedContent,
        mimetype: quotedContent?.mimetype || (quotedType === 'imageMessage' ? 'image/jpeg' : quotedType === 'videoMessage' ? 'video/mp4' : quotedType === 'stickerMessage' ? 'image/webp' : ''),
        seconds: quotedContent?.seconds || 0,
        text: quotedContent?.text || quotedContent?.caption || (quotedType === 'conversation' ? quotedInner.conversation : '') || ''
      };
    }

    // Normalized message object
    const msg = {
      key: rawMsg.key,
      jid,
      sender,
      pushName,
      body,
      type: msgType,
      message: innerMessage,
      mimetype: content?.mimetype || (msgType === 'imageMessage' ? 'image/jpeg' : msgType === 'videoMessage' ? 'video/mp4' : msgType === 'stickerMessage' ? 'image/webp' : ''),
      seconds: content?.seconds || 0,
      mentionedJid: contextInfo?.mentionedJid || [],
      quoted
    };

    // Helper: reply directly to current message
    const reply = async (responseContent, options = {}) => {
      if (typeof responseContent === 'string') {
        return await sock.sendMessage(jid, { text: responseContent, ...options }, { quoted: rawMsg });
      }
      return await sock.sendMessage(jid, responseContent, { quoted: rawMsg, ...options });
    };

    // Helper: download media stream directly from inner message object
    const downloadMedia = async () => {
      let mediaObj = null;
      let mediaType = null;

      // Check quoted message first if available
      if (quoted && quoted.message) {
        if (quoted.message.imageMessage) {
          mediaObj = quoted.message.imageMessage;
          mediaType = 'image';
        } else if (quoted.message.videoMessage) {
          mediaObj = quoted.message.videoMessage;
          mediaType = 'video';
        } else if (quoted.message.stickerMessage) {
          mediaObj = quoted.message.stickerMessage;
          mediaType = 'sticker';
        } else if (quoted.message.audioMessage) {
          mediaObj = quoted.message.audioMessage;
          mediaType = 'audio';
        } else if (quoted.message.documentMessage) {
          mediaObj = quoted.message.documentMessage;
          mediaType = 'document';
        }
      }

      // If quoted didn't have media, check the current message
      if (!mediaObj && innerMessage) {
        if (innerMessage.imageMessage) {
          mediaObj = innerMessage.imageMessage;
          mediaType = 'image';
        } else if (innerMessage.videoMessage) {
          mediaObj = innerMessage.videoMessage;
          mediaType = 'video';
        } else if (innerMessage.stickerMessage) {
          mediaObj = innerMessage.stickerMessage;
          mediaType = 'sticker';
        } else if (innerMessage.audioMessage) {
          mediaObj = innerMessage.audioMessage;
          mediaType = 'audio';
        } else if (innerMessage.documentMessage) {
          mediaObj = innerMessage.documentMessage;
          mediaType = 'document';
        }
      }

      if (!mediaObj || !mediaType) {
        throw new Error('Tidak ditemukan media yang dapat diunduh.');
      }

      const stream = await downloadContentFromMessage(mediaObj, mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };

    // Fetch group metadata if in group
    let groupMetadata = null;
    if (isGroup) {
      const now = Date.now();
      const cached = groupMetadataCache.get(jid);

      if (cached && now - cached.timestamp < 15000) {
        groupMetadata = cached.metadata;
      } else {
        try {
          groupMetadata = await sock.groupMetadata(jid);
          groupMetadataCache.set(jid, { metadata: groupMetadata, timestamp: now });
        } catch (err) {
          logger.warn(`Gagal memuat metadata grup ${jid}:`, err.message);
        }
      }
    }

    // Create execution context
    const context = {
      sock,
      msg,
      args,
      text,
      isGroup,
      sender,
      botJid,
      pushName,
      prefix,
      groupMetadata,
      reply,
      downloadMedia
    };

    // Dispatch to CommandHandler
    await commandHandler.handle({ commandName, context });
  } catch (err) {
    logger.error('Error in messageHandler:', err);
  }
}

export default handleIncomingMessage;
