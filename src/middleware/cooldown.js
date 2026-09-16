import config from '../config/config.js';

class CooldownManager {
  constructor() {
    // Map of key `${userJid}_${commandName}` -> timestamp ms
    this.cooldowns = new Map();
  }

  /**
   * Check if a user is in cooldown for a command
   * @param {string} userJid
   * @param {string} commandName
   * @param {number} customSeconds
   * @returns {{ inCooldown: boolean, remainingMs: number }}
   */
  check(userJid, commandName, customSeconds = null) {
    // Owner is immune to cooldown
    if (config.ownerNumbers.includes(userJid)) {
      return { inCooldown: false, remainingMs: 0 };
    }

    const key = `${userJid}_${commandName}`;
    const now = Date.now();
    const cooldownMs = (customSeconds || config.cooldownSeconds) * 1000;

    const lastTime = this.cooldowns.get(key);
    if (lastTime) {
      const elapsed = now - lastTime;
      if (elapsed < cooldownMs) {
        return {
          inCooldown: true,
          remainingMs: cooldownMs - elapsed
        };
      }
    }

    return { inCooldown: false, remainingMs: 0 };
  }

  /**
   * Set cooldown for a user command
   * @param {string} userJid
   * @param {string} commandName
   */
  set(userJid, commandName) {
    if (config.ownerNumbers.includes(userJid)) return;
    const key = `${userJid}_${commandName}`;
    this.cooldowns.set(key, Date.now());

    // Auto cleanup after 1 minute
    setTimeout(() => {
      this.cooldowns.delete(key);
    }, 60 * 1000);
  }
}

export const cooldown = new CooldownManager();
export default cooldown;
