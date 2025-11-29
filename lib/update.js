const axios = require('axios');
const chalk = require('chalk');

async function checkUpdate(currentVersion) {
    try {
        const { data } = await axios.get('https://api.github.com/repos/YourRepo/TUNZY-MD-V1/releases/latest');
        if (data.tag_name !== currentVersion) {
            console.log(chalk.yellow(`New version available: ${data.tag_name}. Please update!`));
        } else {
            console.log(chalk.green(`You are on the latest version: ${currentVersion}`));
        }
    } catch (err) {
        console.log(chalk.red('Update check failed:', err.message));
    }
}

module.exports = { checkUpdate };