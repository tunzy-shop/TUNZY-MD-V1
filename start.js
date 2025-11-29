const { fork } = require("child_process");
const chalk = require("chalk");

async function start() {
    const child = fork("./index.js");

    child.on("message", msg => {
        console.log("child to parent =>", msg);
    });

    child.on("close", (code) => {
        console.log(chalk.black.bgRed("⚠ Bot closed. Restarting..."));
        start();
    });

    child.on("exit", (code) => {
        console.log(chalk.black.bgYellow("⚠ Bot exited. Restarting..."));
    });
}

start();