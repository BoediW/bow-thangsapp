import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import logger from '../utils/logger.js';
import db from '../database/database.js';
import cooldown from '../middleware/cooldown.js';
import rateLimiter from '../middleware/rateLimit.js';
import permissions from '../middleware/permissions.js';
import { buildErrorMessage } from '../utils/formatter.js';

class CommandHandler {
  constructor() {
    this.commands = new Map(); // name -> command
    this.aliases = new Map();  // alias -> name
  }

  /**
   * Load all commands recursively from commands directory
   * @param {string} commandsDir
   */
  async loadCommands(commandsDir) {
    this.commands.clear();
    this.aliases.clear();

    const readDirRecursive = (dir) => {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(readDirRecursive(fullPath));
        } else if (file.endsWith('.js')) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const commandFiles = readDirRecursive(commandsDir);
    let loadedCount = 0;

    for (const file of commandFiles) {
      try {
        const fileUrl = pathToFileURL(file).href;
        const module = await import(fileUrl);
        const cmd = module.default;

        if (cmd && cmd.name) {
          const name = cmd.name.toLowerCase();
          this.commands.set(name, cmd);

          if (Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              this.aliases.set(alias.toLowerCase(), name);
            }
          }
          loadedCount++;
        }
      } catch (err) {
        logger.error(`Gagal memuat file command: ${file}`, err);
      }
    }

    logger.success(`Berhasil memuat ${loadedCount} perintah dari direktori commands.`);
  }

  /**
   * Retrieve command by name or alias
   * @param {string} nameOrAlias
   * @returns {object|null}
   */
  get(nameOrAlias) {
    if (!nameOrAlias) return null;
    const lower = nameOrAlias.toLowerCase();
    if (this.commands.has(lower)) {
      return this.commands.get(lower);
    }
    const realName = this.aliases.get(lower);
    if (realName && this.commands.has(realName)) {
      return this.commands.get(realName);
    }
    return null;
  }

  /**
   * Execute command through middleware pipeline
   */
  async handle({ commandName, context }) {
    const { sock, msg, sender, isGroup, pushName, reply } = context;
    const cmd = this.get(commandName);

    if (!cmd) return;

    // 1. Anti-spam Rate Limiter check
    if (rateLimiter.isRateLimited(sender)) {
      logger.warn(`Rate limit terpicu untuk pengguna: ${sender}`);
      return await reply('⚠️ Tunggu sebentar sebelum menggunakan command ini lagi.');
    }

    // 2. Permission check
    const permResult = permissions.validate(cmd, context);
    if (!permResult.allowed) {
      return await reply(`❌ ${permResult.reason}`);
    }

    // 3. Cooldown check
    const cdCheck = cooldown.check(sender, cmd.name, cmd.cooldown);
    if (cdCheck.inCooldown) {
      const waitSec = Math.ceil(cdCheck.remainingMs / 1000);
      return await reply(`⏳ Tunggu ${waitSec} detik sebelum menggunakan perintah *${cmd.name}* kembali.`);
    }

    // Set cooldown
    cooldown.set(sender, cmd.name);

    // Log command execution
    logger.cmd(pushName || sender, `${context.prefix}${commandName}`, isGroup);

    // 4. Execute command with error boundary
    try {
      // Pass command registry to context for help/menu commands
      context.commandRegistry = this.commands;
      await cmd.execute(context);

      // Record statistics in database
      db.recordCommandUsage(cmd.name, sender);
    } catch (err) {
      logger.error(`Error saat menjalankan perintah [${cmd.name}]:`, err);
      await reply(buildErrorMessage());
    }
  }
}

export const commandHandler = new CommandHandler();
export default commandHandler;
