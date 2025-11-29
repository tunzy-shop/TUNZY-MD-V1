const { fork } = require('child_process');
const chalk = require('chalk');

function start() {
  const child = fork('./index.js');
  child.on('message', msg => console.log('child =>', msg));
  child.on('close', () => {
    console.log(chalk.bgRed.black('Bot closed — auto restarting...'));
    setTimeout(start, 1500);
  });
  child.on('error', err => {
    console.error('Child process error', err);
  });
}

start();