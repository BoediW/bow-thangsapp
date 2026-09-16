export const defaultSchema = Object.freeze({
  users: {},
  groups: {},
  settings: {
    prefix: '!',
    selfMode: false,
    readStatus: true
  },
  stats: {
    commandsExecuted: 0,
    commandUsage: {}
  },
  bannedUsers: [],
  premiumUsers: []
});

export const defaultUserRecord = (jid) => ({
  jid,
  name: '',
  commandsUsed: 0,
  lastSeen: Date.now(),
  registeredAt: Date.now(),
  isBanned: false,
  isPremium: false
});

export const defaultGroupRecord = (jid) => ({
  jid,
  subject: '',
  antiLink: false,
  welcome: false,
  commandsUsed: 0,
  joinedAt: Date.now()
});
