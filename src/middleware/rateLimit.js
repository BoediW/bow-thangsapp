import config from '../config/config.js';

class RateLimiter {
  constructor(limit = 6, windowSeconds = 10) {
    this.limit = limit;
    this.windowMs = windowSeconds * 1000;
    this.hits = new Map(); // userJid -> [timestamps]
  }

  /**
   * Check if user is exceeding rate limit
   * @param {string} userJid
   * @returns {boolean} true if blocked (rate limited), false if allowed
   */
  isRateLimited(userJid) {
    if (config.ownerNumbers.includes(userJid)) return false;

    const now = Date.now();
    const timestamps = this.hits.get(userJid) || [];

    // Filter out timestamps older than the window
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.limit) {
      this.hits.set(userJid, validTimestamps);
      return true;
    }

    validTimestamps.push(now);
    this.hits.set(userJid, validTimestamps);

    // Clean up memory after window
    setTimeout(() => {
      const current = this.hits.get(userJid);
      if (current) {
        const remaining = current.filter((t) => Date.now() - t < this.windowMs);
        if (remaining.length === 0) {
          this.hits.delete(userJid);
        } else {
          this.hits.set(userJid, remaining);
        }
      }
    }, this.windowMs + 1000);

    return false;
  }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;
