import JsonAdapter from './adapters/jsonAdapter.js';
import { defaultUserRecord, defaultGroupRecord } from './schema.js';
import config from '../config/config.js';

class Database {
  constructor(adapter) {
    this.adapter = adapter || new JsonAdapter();
  }

  async init() {
    await this.adapter.init();
  }

  // --- Users ---
  getUser(jid) {
    const data = this.adapter.getData();
    if (!data.users[jid]) {
      data.users[jid] = defaultUserRecord(jid);
      this.adapter.setData(data);
    } else {
      let updated = false;
      if (typeof data.users[jid].balance !== 'number') {
        data.users[jid].balance = 1000;
        updated = true;
      }
      if (typeof data.users[jid].lastDaily !== 'number') {
        data.users[jid].lastDaily = 0;
        updated = true;
      }
      if (typeof data.users[jid].gachaTokens !== 'number') {
        data.users[jid].gachaTokens = 5;
        updated = true;
      }
      if (typeof data.users[jid].lastTokenClaim !== 'number') {
        data.users[jid].lastTokenClaim = 0;
        updated = true;
      }
      if (!data.users[jid].race) {
        data.users[jid].race = 'Manusia Biasa';
        updated = true;
      }
      if (!data.users[jid].raceRarity) {
        data.users[jid].raceRarity = 'Common';
        updated = true;
      }
      if (!Array.isArray(data.users[jid].inventoryRaces)) {
        data.users[jid].inventoryRaces = [];
        updated = true;
      }
      if (updated) this.adapter.setData(data);
    }
    return data.users[jid];
  }

  updateUser(jid, partial) {
    const data = this.adapter.getData();
    const current = this.getUser(jid);
    data.users[jid] = { ...current, ...partial, lastSeen: Date.now() };
    this.adapter.setData(data);
    return data.users[jid];
  }

  isBanned(jid) {
    const data = this.adapter.getData();
    return Array.isArray(data.bannedUsers) && data.bannedUsers.includes(jid);
  }

  setBanned(jid, banned = true) {
    const data = this.adapter.getData();
    if (!Array.isArray(data.bannedUsers)) data.bannedUsers = [];
    if (banned) {
      if (!data.bannedUsers.includes(jid)) data.bannedUsers.push(jid);
    } else {
      data.bannedUsers = data.bannedUsers.filter((id) => id !== jid);
    }
    this.adapter.setData(data);
  }

  isPremium(jid) {
    const data = this.adapter.getData();
    return Array.isArray(data.premiumUsers) && data.premiumUsers.includes(jid);
  }

  setPremium(jid, premium = true) {
    const data = this.adapter.getData();
    if (!Array.isArray(data.premiumUsers)) data.premiumUsers = [];
    if (premium) {
      if (!data.premiumUsers.includes(jid)) data.premiumUsers.push(jid);
    } else {
      data.premiumUsers = data.premiumUsers.filter((id) => id !== jid);
    }
    this.adapter.setData(data);
  }

  // --- Groups ---
  getGroup(jid) {
    const data = this.adapter.getData();
    if (!data.groups[jid]) {
      data.groups[jid] = defaultGroupRecord(jid);
      this.adapter.setData(data);
    }
    return data.groups[jid];
  }

  updateGroup(jid, partial) {
    const data = this.adapter.getData();
    const current = this.getGroup(jid);
    data.groups[jid] = { ...current, ...partial };
    this.adapter.setData(data);
    return data.groups[jid];
  }

  // --- Settings ---
  getSetting(key, defaultValue = null) {
    const data = this.adapter.getData();
    if (data.settings && key in data.settings) {
      return data.settings[key];
    }
    return defaultValue;
  }

  setSetting(key, value) {
    const data = this.adapter.getData();
    if (!data.settings) data.settings = {};
    data.settings[key] = value;
    this.adapter.setData(data);
  }

  getPrefix() {
    return this.getSetting('prefix', config.defaultPrefix);
  }

  setPrefix(prefix) {
    this.setSetting('prefix', prefix);
  }

  // --- Statistics ---
  recordCommandUsage(cmdName, userJid) {
    const data = this.adapter.getData();
    if (!data.stats) data.stats = { commandsExecuted: 0, commandUsage: {} };
    data.stats.commandsExecuted = (data.stats.commandsExecuted || 0) + 1;
    data.stats.commandUsage[cmdName] = (data.stats.commandUsage[cmdName] || 0) + 1;

    // Update user stats
    this.getUser(userJid);
    data.users[userJid].commandsUsed = (data.users[userJid].commandsUsed || 0) + 1;
    data.users[userJid].lastSeen = Date.now();

    this.adapter.setData(data);
  }

  getStats() {
    const data = this.adapter.getData();
    return data.stats || { commandsExecuted: 0, commandUsage: {} };
  }

  async close() {
    await this.adapter.flush();
  }
}

export const db = new Database();
export default db;
