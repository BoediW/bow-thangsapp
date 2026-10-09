import db from '../../database/database.js';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export default {
  name: 'roulette',
  aliases: ['rulet', 'casino'],
  category: 'fun',
  description: 'Permainan Casino Roulette dengan uang virtual',
  usage: '<pilihan> <jumlah_taruhan>',
  cooldown: 3,
  async execute({ sender, args, reply, prefix }) {
    const user = db.getUser(sender);

    if (args.length < 2) {
      return await reply(
        `🎰 *CASINO ROULETTE* 🎰\n\n` +
        `💰 Saldo Anda: *$${user.balance.toLocaleString('id-ID')}*\n\n` +
        `*Cara Bermain:*\n` +
        `\`${prefix}roulette <taruhan> <nominal>\`\n\n` +
        `*Pilihan Taruhan:*\n` +
        `• *red* / *merah* (Menang 2x)\n` +
        `• *black* / *hitam* (Menang 2x)\n` +
        `• *even* / *genap* (Menang 2x)\n` +
        `• *odd* / *ganjil* (Menang 2x)\n` +
        `• *1st* (Angka 1-12, Menang 3x)\n` +
        `• *2nd* (Angka 13-24, Menang 3x)\n` +
        `• *3rd* (Angka 25-36, Menang 3x)\n` +
        `• *green* / *hijau* (Angka 0, Menang 36x)\n` +
        `• *<0-36>* (Tebak Angka Pas, Menang 36x)\n\n` +
        `*Contoh Usage:*\n` +
        `• \`${prefix}roulette red 100\`\n` +
        `• \`${prefix}roulette 7 500\`\n` +
        `• \`${prefix}roulette even all\`\n\n` +
        `💡 _Ketik \`${prefix}daily\` untuk klaim saldo harian gratis!_`
      );
    }

    const choiceInput = args[0].toLowerCase();
    const betInput = args[1].toLowerCase();

    let betAmount = 0;
    if (betInput === 'all' || betInput === 'allin') {
      betAmount = user.balance;
    } else {
      betAmount = parseInt(betInput, 10);
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      return await reply('❌ Jumlah taruhan tidak valid! Masukkan angka positif atau *all*.');
    }

    if (user.balance < betAmount) {
      return await reply(`❌ Saldo Anda tidak cukup! Saldo Anda saat ini: *$${user.balance.toLocaleString('id-ID')}*`);
    }

    // Spin roulette wheel (0 - 36)
    const rolledNumber = Math.floor(Math.random() * 37);
    let color = '🟢 GREEN';
    let colorIcon = '🟢';
    if (RED_NUMBERS.includes(rolledNumber)) {
      color = '🔴 RED';
      colorIcon = '🔴';
    } else if (BLACK_NUMBERS.includes(rolledNumber)) {
      color = '⬛ BLACK';
      colorIcon = '⬛';
    }

    let isWin = false;
    let multiplier = 0;

    // Evaluate bet
    if (choiceInput === 'red' || choiceInput === 'merah') {
      if (RED_NUMBERS.includes(rolledNumber)) {
        isWin = true;
        multiplier = 2;
      }
    } else if (choiceInput === 'black' || choiceInput === 'hitam') {
      if (BLACK_NUMBERS.includes(rolledNumber)) {
        isWin = true;
        multiplier = 2;
      }
    } else if (choiceInput === 'green' || choiceInput === 'hijau') {
      if (rolledNumber === 0) {
        isWin = true;
        multiplier = 36;
      }
    } else if (choiceInput === 'even' || choiceInput === 'genap') {
      if (rolledNumber !== 0 && rolledNumber % 2 === 0) {
        isWin = true;
        multiplier = 2;
      }
    } else if (choiceInput === 'odd' || choiceInput === 'ganjil') {
      if (rolledNumber % 2 !== 0) {
        isWin = true;
        multiplier = 2;
      }
    } else if (choiceInput === '1st' || choiceInput === '1-12') {
      if (rolledNumber >= 1 && rolledNumber <= 12) {
        isWin = true;
        multiplier = 3;
      }
    } else if (choiceInput === '2nd' || choiceInput === '13-24') {
      if (rolledNumber >= 13 && rolledNumber <= 24) {
        isWin = true;
        multiplier = 3;
      }
    } else if (choiceInput === '3rd' || choiceInput === '25-36') {
      if (rolledNumber >= 25 && rolledNumber <= 36) {
        isWin = true;
        multiplier = 3;
      }
    } else if (!isNaN(parseInt(choiceInput, 10))) {
      const chosenNum = parseInt(choiceInput, 10);
      if (chosenNum >= 0 && chosenNum <= 36) {
        if (rolledNumber === chosenNum) {
          isWin = true;
          multiplier = 36;
        }
      } else {
        return await reply('❌ Angka tebakan harus antara 0 hingga 36!');
      }
    } else {
      return await reply('❌ Pilihan taruhan tidak valid! Contoh pilihan: *red*, *black*, *even*, *odd*, *green*, atau angka *0-36*.');
    }

    let newBalance = user.balance;
    let resultMsg = '';

    if (isWin) {
      const winAmount = betAmount * multiplier;
      const profit = winAmount - betAmount;
      newBalance += profit;
      db.updateUser(sender, { balance: newBalance });

      resultMsg =
        `🎡 *ROULETTE RESULT* 🎡\n\n` +
        `Hasil Spin: *${rolledNumber}* ${colorIcon} (${color})\n` +
        `Pilihan Anda: *${choiceInput.toUpperCase()}*\n` +
        `Taruhan: *$${betAmount.toLocaleString('id-ID')}*\n\n` +
        `🎉 *SELAMAT! KAMU MENANG!* 🎉\n` +
        `Profit: *+$${profit.toLocaleString('id-ID')}* (${multiplier}x)\n` +
        `💰 Saldo Baru: *$${newBalance.toLocaleString('id-ID')}*`;
    } else {
      newBalance -= betAmount;
      db.updateUser(sender, { balance: newBalance });

      resultMsg =
        `🎡 *ROULETTE RESULT* 🎡\n\n` +
        `Hasil Spin: *${rolledNumber}* ${colorIcon} (${color})\n` +
        `Pilihan Anda: *${choiceInput.toUpperCase()}*\n` +
        `Taruhan: *$${betAmount.toLocaleString('id-ID')}*\n\n` +
        `💀 *KAMU KALAH!* 💀\n` +
        `Rugi: *-$${betAmount.toLocaleString('id-ID')}*\n` +
        `💰 Saldo Baru: *$${newBalance.toLocaleString('id-ID')}*`;
    }

    await reply(resultMsg);
  }
};
