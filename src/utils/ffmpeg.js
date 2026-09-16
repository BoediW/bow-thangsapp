import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import config from '../config/config.js';
import logger from './logger.js';
import tempManager from './tempManager.js';

if (config.ffmpegPath) {
  ffmpeg.setFfmpegPath(config.ffmpegPath);
}

/**
 * Helper to run ffmpeg command promise-based
 * @param {ffmpeg.FfmpegCommand} command
 * @returns {Promise<string>}
 */
function runCommand(command, outputPath) {
  return new Promise((resolve, reject) => {
    command
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        logger.error('FFmpeg execution error:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

export const mediaHelper = {
  /**
   * Convert any video or audio to MP3
   * @param {string} inputPath
   * @returns {Promise<string>} output MP3 path
   */
  async toMp3(inputPath) {
    const outputPath = tempManager.createTempPath('mp3');
    const cmd = ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .format('mp3');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Convert audio to WhatsApp PTT Voice Note (Opus/OGG)
   * @param {string} inputPath
   * @returns {Promise<string>} output OGG path
   */
  async toVoiceNote(inputPath) {
    const outputPath = tempManager.createTempPath('ogg');
    const cmd = ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libopus')
      .audioBitrate('64k')
      .format('ogg');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Compress video file
   * @param {string} inputPath
   * @returns {Promise<string>} output compressed MP4 path
   */
  async compressVideo(inputPath) {
    const outputPath = tempManager.createTempPath('mp4');
    const cmd = ffmpeg(inputPath)
      .videoCodec('libx264')
      .size('640x?')
      .fps(24)
      .videoBitrate('500k')
      .audioCodec('aac')
      .audioBitrate('64k')
      .format('mp4');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Resize image
   * @param {string} inputPath
   * @param {number} width
   * @param {number} height
   * @returns {Promise<string>} output image path
   */
  async resizeImage(inputPath, width = 500, height = 500) {
    const outputPath = tempManager.createTempPath('jpg');
    const cmd = ffmpeg(inputPath)
      .size(`${width}x${height}`)
      .format('image2');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Convert video to WebP sticker (animated)
   * @param {string} inputPath
   * @param {number} durationSeconds (max 6s for WhatsApp sticker)
   * @returns {Promise<string>} output WebP path
   */
  async toAnimatedWebp(inputPath, durationSeconds = 6) {
    const outputPath = tempManager.createTempPath('webp');
    const cmd = ffmpeg(inputPath)
      .setDuration(durationSeconds)
      .fps(15)
      .size('512x512')
      .videoFilters([
        'scale=512:512:force_original_aspect_ratio=decrease',
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000'
      ])
      .videoCodec('libwebp')
      .outputOptions([
        '-vcodec', 'libwebp',
        '-filter:v', 'fps=fps=15',
        '-lossless', '0',
        '-compression_level', '4',
        '-q:v', '50',
        '-loop', '0',
        '-preset', 'picture',
        '-an',
        '-vsync', '0',
        '-s', '512:512'
      ])
      .format('webp');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Convert static image to 512x512 WebP sticker
   * @param {string} inputPath
   * @returns {Promise<string>} output WebP path
   */
  async toStaticWebp(inputPath) {
    const outputPath = tempManager.createTempPath('webp');
    const cmd = ffmpeg(inputPath)
      .videoFilters([
        'scale=512:512:force_original_aspect_ratio=decrease',
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000'
      ])
      .outputOptions([
        '-vcodec', 'libwebp',
        '-lossless', '0',
        '-q:v', '80'
      ])
      .format('webp');

    return await runCommand(cmd, outputPath);
  },

  /**
   * Convert WebP sticker to static PNG/JPG
   * @param {string} inputPath
   * @returns {Promise<string>} output PNG path
   */
  async webpToPng(inputPath) {
    const outputPath = tempManager.createTempPath('png');
    const cmd = ffmpeg(inputPath)
      .format('image2');

    return await runCommand(cmd, outputPath);
  }
};

export default mediaHelper;
