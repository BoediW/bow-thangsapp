import db from '../../database/database.js';
import { cleanJid } from '../../utils/formatter.js';

// In-memory active games storage: jid -> gameState
const activeGames = new Map();
const GAME_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout

export default {
  name: 'rr',
  aliases: ['russianroulette', 'ruletpistol'],
  category: 'fun',
  description: 'Permainan Russian Roulette 1v1 dengan revolver 6 silinder',
  usage: '<@user / bot / shoot / pass / cancel> [bet]',
  cooldown: 1,
  async execute({ jid, sender, msg, args, reply, botJid, prefix }) {
    const action = args[0] ? args[0].toLowerCase() : '';
    const currentGame = activeGames.get(jid);

    const processShoot = async (shooterJid) => {
      const game = activeGames.get(jid);
      if (!game) return;

      if (game.timer) clearTimeout(game.timer);

      const otherJid = shooterJid === game.playerA ? game.playerB : game.playerA;
      game.currentChamber += 1;

      if (game.currentChamber === game.bulletPosition) {
        // BANG! Player loses
        activeGames.delete(jid);
        
        let rewardMsg = '';
        if (cleanJid(otherJid) !== cleanJid(botJid)) {
          const winnerData = db.getUser(otherJid);
          if (game.bet > 0) {
            const reward = game.bet * 2;
            db.updateUser(otherJid, { balance: winnerData.balance + reward });
            rewardMsg = `\n\n💰 @${otherJid.split('@')[0]} mendapatkan hadiah sebesar ${reward} balance!`;
          } else {
            db.updateUser(otherJid, { balance: winnerData.balance + 100 });
            rewardMsg = `\n\n💰 @${otherJid.split('@')[0]} mendapatkan hadiah 100 balance!`;
          }
        }

        return await reply(
          {
            text:
              `💥 *BANGGGGG!* 💥\n\n` +
              `Peluru meletus di kepala @${shooterJid.split('@')[0]}! 💀\n\n` +
              `yahh kalah tolol,dasar nigger\n\n` +
              `🏆 Selamat kepada @${otherJid.split('@')[0]} karena berhasil bertahan hidup!${rewardMsg}`,
            mentions: [shooterJid, otherJid]
          }
        );
      } else {
        // CLICK! Empty chamber, switch turn
        game.turn = otherJid;

        // Reset timeout timer for next turn
        game.timer = setTimeout(() => {
          if (activeGames.has(jid)) {
            const g = activeGames.get(jid);
            // Refund bet if game cancelled
            if (g.bet > 0) {
               if (cleanJid(g.playerA) !== cleanJid(botJid)) {
                 const uA = db.getUser(g.playerA);
                 db.updateUser(g.playerA, { balance: uA.balance + g.bet });
               }
               if (cleanJid(g.playerB) !== cleanJid(botJid)) {
                 const uB = db.getUser(g.playerB);
                 db.updateUser(g.playerB, { balance: uB.balance + g.bet });
               }
            }
            activeGames.delete(jid);
            reply(`⏳ Permainan Russian Roulette dibatalkan karena tidak ada pergerakan selama 3 menit.`);
          }
        }, GAME_TIMEOUT_MS);

        await reply(
          {
            text:
              `*CLICK!* 🔇 (Chamber ${game.currentChamber}/6 KOSONG)\n\n` +
              `@${shooterJid.split('@')[0]} selamat dari maut! 😮‍💨\n\n` +
              `🎯 *Giliran berikutnya: @${otherJid.split('@')[0]}*\n` +
              `Ketik \`${prefix}rr shoot\` untuk menarik pelatuk!`,
            mentions: [shooterJid, otherJid]
          }
        );

        // Auto-shoot if it's bot's turn
        if (cleanJid(otherJid) === cleanJid(botJid)) {
          setTimeout(() => {
             processShoot(botJid);
          }, 2000);
        }
      }
    };

    // --- SUB-COMMAND: SHOOT / TEMBAK ---
    if (action === 'shoot' || action === 'tembak' || action === 'pull') {
      if (!currentGame) {
        return await reply(`❌ Tidak ada permainan Russian Roulette yang sedang berlangsung di chat ini.\nKetik \`${prefix}rr @user\` atau \`${prefix}rr bot\` untuk menantang seseorang.`);
      }

      if (sender !== currentGame.turn) {
        return await reply(`❌ Sekarang bukan giliranmu!\nGiliran: @${currentGame.turn.split('@')[0]}`, {
          mentions: [currentGame.turn]
        });
      }
      
      await processShoot(sender);
      return;
    }

    // --- SUB-COMMAND: PASS / MENYERAH ---
    if (action === 'pass' || action === 'menyerah' || action === 'surrender') {
      if (!currentGame) {
        return await reply('❌ Tidak ada permainan Russian Roulette yang sedang berlangsung di chat ini.');
      }

      if (sender !== currentGame.playerA && sender !== currentGame.playerB) {
        return await reply('❌ Kamu tidak sedang bermain dalam game ini.');
      }

      if (currentGame.timer) clearTimeout(currentGame.timer);
      const winnerJid = sender === currentGame.playerA ? currentGame.playerB : currentGame.playerA;
      
      let rewardMsg = '';
      if (cleanJid(winnerJid) !== cleanJid(botJid)) {
         const winnerData = db.getUser(winnerJid);
         if (currentGame.bet > 0) {
           const reward = currentGame.bet * 2;
           db.updateUser(winnerJid, { balance: winnerData.balance + reward });
           rewardMsg = `\n\n💰 @${winnerJid.split('@')[0]} mendapatkan hadiah sebesar ${reward} balance!`;
         } else {
           db.updateUser(winnerJid, { balance: winnerData.balance + 100 });
           rewardMsg = `\n\n💰 @${winnerJid.split('@')[0]} mendapatkan hadiah 100 balance!`;
         }
      }

      activeGames.delete(jid);

      return await reply(
        {
          text:
            `🏳️ @${sender.split('@')[0]} menyerah dan lari ketakutan!\n\n` +
            `🏆 Selamat kepada @${winnerJid.split('@')[0]} atas kemenangannya!${rewardMsg}`,
          mentions: [sender, winnerJid]
        }
      );
    }

    // --- SUB-COMMAND: CANCEL / BATALKAN ---
    if (action === 'cancel' || action === 'stop' || action === 'batal') {
      if (!currentGame) {
        return await reply('❌ Tidak ada permainan Russian Roulette yang sedang berlangsung.');
      }

      if (sender !== currentGame.playerA && sender !== currentGame.playerB) {
        return await reply('❌ Hanya pemain yang sedang bertanding yang dapat membatalkan permainan.');
      }

      if (currentGame.timer) clearTimeout(currentGame.timer);
      
      // Refund bet if game cancelled
      if (currentGame.bet > 0) {
         if (cleanJid(currentGame.playerA) !== cleanJid(botJid)) {
           const uA = db.getUser(currentGame.playerA);
           db.updateUser(currentGame.playerA, { balance: uA.balance + currentGame.bet });
         }
         if (cleanJid(currentGame.playerB) !== cleanJid(botJid)) {
           const uB = db.getUser(currentGame.playerB);
           db.updateUser(currentGame.playerB, { balance: uB.balance + currentGame.bet });
         }
      }
      activeGames.delete(jid);

      return await reply('🛑 Permainan Russian Roulette telah dibatalkan.');
    }

    // --- CREATE NEW GAME: !rr @user [bet] ---
    if (currentGame) {
      return await reply(
        {
          text:
            `⚠️ Masih ada permainan Russian Roulette yang sedang berjalan antara @${currentGame.playerA.split('@')[0]} dan @${currentGame.playerB.split('@')[0]}!\n\n` +
            `Giliran: @${currentGame.turn.split('@')[0]}\n` +
            `Ketik \`${prefix}rr shoot\` untuk menembak.`,
          mentions: [currentGame.playerA, currentGame.playerB, currentGame.turn]
        }
      );
    }

    let targetJid = msg.mentionedJid && msg.mentionedJid[0];
    if (!targetJid && msg.quoted && msg.quoted.sender) {
      targetJid = msg.quoted.sender;
    }
    
    if (!targetJid && action === 'bot') {
      targetJid = botJid;
    }

    if (!targetJid) {
      return await reply(
        `🔫 *RUSSIAN ROULETTE (1v1)* 🔫\n\n` +
        `*Cara Bermain:*\n` +
        `1. Tag lawanmu atau bot untuk menantang: \`${prefix}rr @user\` / \`${prefix}rr bot\`\n` +
        `2. Tambahkan bet (opsional): \`${prefix}rr @user 100\`\n` +
        `3. Bergiliran menarik pelatuk: \`${prefix}rr shoot\`\n` +
        `4. Pasrah/Menyerah: \`${prefix}rr pass\`\n` +
        `5. Batalkan game: \`${prefix}rr cancel\`\n\n` +
        `⚠️ _Terdapat 6 silinder dengan 1 peluru tajam. Siapa yang tertembak akan kalah!_\n` +
        `💰 *Hadiah:* Menang dapat 100 balance. Jika pakai bet, hadiah = bet x 2.`
      );
    }

    if (targetJid === sender) {
      return await reply('❌ Kamu tidak bisa menantang dirimu sendiri!');
    }

    // Parse bet amount
    let betAmount = 0;
    for (const arg of args) {
      const num = parseInt(arg);
      if (!isNaN(num) && num > 0 && !arg.startsWith('@') && arg.toLowerCase() !== 'bot') {
        betAmount = num;
        break;
      }
    }

    // Handle Balance for bet
    if (betAmount > 0) {
       const userA = db.getUser(sender);
       if (userA.balance < betAmount) {
         return await reply(`❌ Balance kamu tidak cukup untuk bertaruh ${betAmount}. (Balance kamu: ${userA.balance})`);
       }
       if (cleanJid(targetJid) !== cleanJid(botJid)) {
          const userB = db.getUser(targetJid);
          if (userB.balance < betAmount) {
            return await reply(`❌ Balance @${targetJid.split('@')[0]} tidak cukup untuk bertaruh ${betAmount}. (Balance dia: ${userB.balance})`, { mentions: [targetJid] });
          }
       }
       
       // Deduct immediately
       db.updateUser(sender, { balance: userA.balance - betAmount });
       if (cleanJid(targetJid) !== cleanJid(botJid)) {
          const userB = db.getUser(targetJid);
          db.updateUser(targetJid, { balance: userB.balance - betAmount });
       }
    }

    // Random bullet position (1 to 6)
    const bulletPosition = Math.floor(Math.random() * 6) + 1;

    const timer = setTimeout(() => {
      if (activeGames.has(jid)) {
        const g = activeGames.get(jid);
        if (g.bet > 0) {
           if (cleanJid(g.playerA) !== cleanJid(botJid)) {
             const uA = db.getUser(g.playerA);
             db.updateUser(g.playerA, { balance: uA.balance + g.bet });
           }
           if (cleanJid(g.playerB) !== cleanJid(botJid)) {
             const uB = db.getUser(g.playerB);
             db.updateUser(g.playerB, { balance: uB.balance + g.bet });
           }
        }
        activeGames.delete(jid);
        reply(`⏳ Permainan Russian Roulette antara @${sender.split('@')[0]} dan @${targetJid.split('@')[0]} dibatalkan karena waktu habis (3 menit).`, {
          mentions: [sender, targetJid]
        });
      }
    }, GAME_TIMEOUT_MS);

    activeGames.set(jid, {
      playerA: sender,
      playerB: targetJid,
      bulletPosition,
      currentChamber: 0,
      turn: sender,
      timer,
      bet: betAmount
    });

    const betInfo = betAmount > 0 ? `\n💵 *Bet:* ${betAmount} Balance` : `\n💵 *Tanpa Bet* (Hadiah Default 100 Balance)`;

    await reply(
      {
        text:
          `🔫 *RUSSIAN ROULETTE DIMULAI!* 🔫\n\n` +
          `⚔️ @${sender.split('@')[0]} vs @${targetJid.split('@')[0]}${betInfo}\n` +
          `🎲 Chamber: 6 Silinder (1 Peluru Tajam, 5 Kosong)\n\n` +
          `🎯 *Giliran Pertama: @${sender.split('@')[0]}*\n\n` +
          `Ketik \`${prefix}rr shoot\` untuk menarik pelatuk!\n` +
          `Ketik \`${prefix}rr pass\` jika ingin menyerah.`,
        mentions: [sender, targetJid]
      }
    );
  }
};
