const { ownerNumber, botName, channelLink, groupLink } = require('../config');

function getCommandsMenu(name) {
    return `
Wassup ${name} 👋
♣ PUBLIC COMMANDS
.ping, .menu, .play <song>, .repo, .owner, .tiktok <link>, .save

♣ ADMIN COMMANDS
.add, .kick, .tag, .tagall, .hidetag, .accept all, .antilink, .open, .close, .promote, .demote

♣ OWNER COMMANDS
.ban, .unban, .block, .anticall, .mode

♣ GROUP COMMANDS
.gc link, .list admin, .list online

Owner: ${ownerNumber}
Channel: ${channelLink}
Group: ${groupLink}
`;
}

module.exports = { getCommandsMenu };