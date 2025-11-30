const { fork } = require("child_process");
const chalk = require("chalk");

function start() {
    const child = fork("./index.js");

    child.on("message", msg => {
        console.log("child => parent:", msg);
    });

    child.on("close", () => {
        console.log(chalk.bgRed.black("Bot crashed. Auto-restarting..."));
        start();
    });

    child.on("exit", () => {});
}

start();