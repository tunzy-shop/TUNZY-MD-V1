const fs = require('fs');
const chalk = require('chalk');

module.exports = {
    checkUpdate: async (currentVersion, latestVersion) => {
        if (currentVersion !== latestVersion) {
            console.log(chalk.yellow(`⚠ Update available! Current: ${currentVersion}, Latest: ${latestVersion}`));
            return true;
        }
        console.log(chalk.green('✅ Bot is up-to-date.'));
        return false;
    },

    autoUpdate: async (gitRepo, branch = 'main') => {
        const { exec } = require('child_process');
        console.log(chalk.blue(`📦 Pulling latest updates from ${gitRepo}`));
        exec(`git pull ${gitRepo} ${branch}`, (err, stdout, stderr) => {
            if (err) return console.error(chalk.red(err));
            console.log(chalk.green(stdout));
        });
    }
}