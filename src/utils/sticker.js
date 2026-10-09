import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import mediaHelper from './ffmpeg.js';
import tempManager from './tempManager.js';
import logger from './logger.js';

/**
 * Creates raw EXIF buffer containing WhatsApp sticker metadata
 * @param {string} packName
 * @param {string} authorName
 * @param {string[]} emojis
 * @returns {Buffer}
 */
export function createExifBuffer(packName, authorName, emojis = ['🤖']) {
  const json = {
    'sticker-pack-id': 'antigravity-bot-sticker',
    'sticker-pack-name': packName || config.stickerPack,
    'sticker-pack-publisher': authorName || config.stickerAuthor,
    'emojis': emojis
  };

  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ]);

  exifHeader.writeUIntLE(jsonBuff.length, 14, 4);
  return Buffer.concat([exifHeader, jsonBuff]);
}

/**
 * Inject EXIF chunk into WebP buffer
 * @param {Buffer} webpBuffer
 * @param {Buffer} exifBuffer
 * @returns {Buffer}
 */
export function injectExif(webpBuffer, exifBuffer) {
  // Check if WebP RIFF header
  if (webpBuffer.toString('utf-8', 0, 4) !== 'RIFF' || webpBuffer.toString('utf-8', 8, 12) !== 'WEBP') {
    throw new Error('Invalid WebP buffer');
  }

  // Look for existing EXIF chunk and strip it
  let offset = 12;
  const chunks = [];
  let vp8xFound = false;

  while (offset < webpBuffer.length) {
    const chunkHeader = webpBuffer.toString('utf-8', offset, offset + 4);
    const chunkSize = webpBuffer.readUInt32LE(offset + 4);
    const paddedSize = chunkSize + (chunkSize % 2);

    if (chunkHeader === 'VP8X') {
      vp8xFound = true;
      const vp8xChunk = webpBuffer.subarray(offset, offset + 8 + paddedSize);
      // Set EXIF flag (bit 3) in the VP8X flags (byte 8)
      vp8xChunk[8] |= 0x08;
      chunks.push(vp8xChunk);
    } else if (chunkHeader !== 'EXIF') {
      chunks.push(webpBuffer.subarray(offset, offset + 8 + paddedSize));
    }
    offset += 8 + paddedSize;
  }

  if (!vp8xFound) {
    // Create a new VP8X chunk since the image didn't have one.
    // We know all our stickers are strictly 512x512.
    // 512 - 1 = 511 (0x01FF in little endian: FF 01 00)
    const vp8xChunk = Buffer.from([
      0x56, 0x50, 0x38, 0x58, // 'VP8X'
      0x0A, 0x00, 0x00, 0x00, // Size: 10
      0x08,                   // Flags: EXIF (bit 3)
      0x00, 0x00, 0x00,       // Reserved
      0xFF, 0x01, 0x00,       // Canvas Width - 1 (511)
      0xFF, 0x01, 0x00        // Canvas Height - 1 (511)
    ]);
    chunks.unshift(vp8xChunk);
  }

  // Construct new EXIF chunk
  const exifChunkHeader = Buffer.from('EXIF');
  const exifChunkSize = Buffer.alloc(4);
  exifChunkSize.writeUInt32LE(exifBuffer.length, 0);
  const padding = exifBuffer.length % 2 === 1 ? Buffer.alloc(1) : Buffer.alloc(0);

  const newExifChunk = Buffer.concat([exifChunkHeader, exifChunkSize, exifBuffer, padding]);
  chunks.push(newExifChunk);

  // Calculate new total file size
  let totalDataLength = 4; // 'WEBP'
  for (const c of chunks) {
    totalDataLength += c.length;
  }

  const riffHeader = Buffer.from('RIFF');
  const riffSize = Buffer.alloc(4);
  riffSize.writeUInt32LE(totalDataLength, 0);
  const webpHeader = Buffer.from('WEBP');

  return Buffer.concat([riffHeader, riffSize, webpHeader, ...chunks]);
}

import sharp from 'sharp';

export const stickerHelper = {
  /**
   * Convert media buffer/file to sticker with metadata
   * @param {Buffer|string} input - buffer or filePath
   * @param {object} options
   * @param {string} [options.pack]
   * @param {string} [options.author]
   * @param {boolean} [options.isVideo]
   * @returns {Promise<Buffer>} sticker buffer
   */
  async createSticker(input, options = {}) {
    const pack = options.pack || config.stickerPack;
    const author = options.author || config.stickerAuthor;
    const isVideo = !!options.isVideo;

    // Fast-path for static image using Sharp (no FFmpeg needed, instant & reliable)
    if (!isVideo) {
      try {
        const inputBuffer = Buffer.isBuffer(input) ? input : await fs.promises.readFile(input);
        const webpBuffer = await sharp(inputBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 80 })
          .toBuffer();

        const exifBuff = createExifBuffer(pack, author);
        return injectExif(webpBuffer, exifBuff);
      } catch (sharpErr) {
        logger.warn('Sharp conversion gagal, mencoba fallback ke FFmpeg...', sharpErr.message);
      }
    }

    // Fallback or animated video using FFmpeg
    let inputPath;
    let isTempInput = false;

    if (Buffer.isBuffer(input)) {
      inputPath = await tempManager.writeTempFile(input, isVideo ? 'mp4' : 'png');
      isTempInput = true;
    } else {
      inputPath = input;
    }

    let webpPath;
    try {
      if (isVideo) {
        webpPath = await mediaHelper.toAnimatedWebp(inputPath, 6);
      } else {
        webpPath = await mediaHelper.toStaticWebp(inputPath);
      }

      const webpRawBuffer = await fs.promises.readFile(webpPath);
      const exifBuff = createExifBuffer(pack, author);
      const finalWebpBuffer = injectExif(webpRawBuffer, exifBuff);

      return finalWebpBuffer;
    } catch (err) {
      logger.error('Error saat membuat sticker (FFmpeg):', err);
      if (err.message && err.message.includes('Cannot find ffmpeg')) {
        throw new Error('FFmpeg belum terpasang di sistem untuk memproses video. Pasang FFmpeg terlebih dahulu.');
      }
      throw err;
    } finally {
      if (isTempInput) await tempManager.cleanup(inputPath);
      if (webpPath) await tempManager.cleanup(webpPath);
    }
  },

  /**
   * Change sticker pack and author metadata
   * @param {Buffer} stickerBuffer
   * @param {string} pack
   * @param {string} author
   * @returns {Buffer}
   */
  async changeMetadata(stickerBuffer, pack, author) {
    const exif = createExifBuffer(pack, author);
    return injectExif(stickerBuffer, exif);
  }
};

export default stickerHelper;
