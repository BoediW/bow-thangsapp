import config from '../config/config.js';

class MediaLimits {
  constructor() {
    this.activeTasks = 0;
    this.maxConcurrent = config.maxConcurrentMedia || 3;
  }

  /**
   * Acquire a slot for media processing
   * @returns {boolean} true if acquired, false if busy
   */
  acquireSlot() {
    if (this.activeTasks >= this.maxConcurrent) {
      return false;
    }
    this.activeTasks++;
    return true;
  }

  /**
   * Release an acquired processing slot
   */
  releaseSlot() {
    if (this.activeTasks > 0) {
      this.activeTasks--;
    }
  }

  /**
   * Check if file size in bytes exceeds max limit
   * @param {number} sizeBytes
   * @returns {boolean}
   */
  isExceedingSize(sizeBytes) {
    const maxBytes = config.maxFileSizeMB * 1024 * 1024;
    return sizeBytes > maxBytes;
  }
}

export const mediaLimits = new MediaLimits();
export default mediaLimits;
