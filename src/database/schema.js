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
  isPremium: false,
  balance: 1000,
  lastDaily: 0,
  gachaTokens: 5,
  lastTokenClaim: 0,
  race: 'Manusia Biasa',
  raceRarity: 'Common',
  inventoryRaces: []
});

export const defaultGroupRecord = (jid) => ({
  jid,
  subject: '',
  antiLink: false,
  welcome: false,
  commandsUsed: 0,
  joinedAt: Date.now()
});
