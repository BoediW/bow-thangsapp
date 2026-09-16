import chalk from 'chalk';

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

export const logger = {
  info(message, ...args) {
    console.log(
      chalk.gray(`[${getTimestamp()}]`),
      chalk.cyanBright('[INFO]'),
      message,
      ...args
    );
  },

  success(message, ...args) {
    console.log(
      chalk.gray(`[${getTimestamp()}]`),
      chalk.greenBright('[SUCCESS]'),
      message,
      ...args
    );
  },

  warn(message, ...args) {
    console.warn(
      chalk.gray(`[${getTimestamp()}]`),
      chalk.yellowBright('[WARN]'),
      message,
      ...args
    );
  },

  error(message, err) {
    console.error(
      chalk.gray(`[${getTimestamp()}]`),
      chalk.redBright('[ERROR]'),
      message
    );
    if (err) {
      if (err.stack) {
        console.error(chalk.red(err.stack));
      } else {
        console.error(chalk.red(String(err)));
      }
    }
  },

  cmd(user, command, fromGroup = false) {
    const scope = fromGroup ? chalk.magenta('[GROUP]') : chalk.blue('[PRIVATE]');
    console.log(
      chalk.gray(`[${getTimestamp()}]`),
      chalk.magentaBright('[CMD]'),
      scope,
      chalk.yellow(command),
      'from',
      chalk.cyan(user)
    );
  }
};

export default logger;
