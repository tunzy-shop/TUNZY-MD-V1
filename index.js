// TUNZY-MD-V1 index.js
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { state, saveState } = useSingleFileAuthState('./tmp/session.json');
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const { ownerNumber, botName, channelLink, groupLink, prefix } = require('./config');
const { handleCommands } = require('./lib/functions');

async function startBot() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your WhatsApp number (with country code, e.g +234...): ', async (number) => {
        console.log(chalk.green('Generating pairing code...'));

        const { version } = await fetchLatestBaileysVersion();
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            version
        });

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (connection === 'open') {
                console.log(chalk.green(`${botName} connected successfully!`));
                console.log(chalk.yellow(`
Wassup ${number} 👋

♣ PUBLIC COMMANDS
.ping, .menu, .play <song>, .repo, .owner, .tiktok <link>, .save

♣ ADMIN COMMANDS
.add, .kick, .tag, .tagall, .hidetag, .accept all, .antilink, .open, .close, .promote, .demote

♣ OWNER COMMANDS
.ban, .unban, .block, .anticall, .mode

♣ GROUP COMMANDS
.gc link, .list admin, .list online

Owner: ${botName} (${ownerNumber})
Channel: ${channelLink}
Group: ${groupLink}
                `));
                rl.close();
            } else if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    console.log(chalk.red('Bot disconnected, restarting...'));
                    startBot();
                } else {
                    console.log(chalk.red('Logged out, please delete session.json and try again.'));
                }
            } else if (qr) {
                console.log(chalk.blue('Paste this pairing code in WhatsApp → Settings → Linked Devices → Link a Device:'));
                console.log(chalk.green(qr));
            }
        });

        sock.ev.on('creds.update', saveState);

        // Listen for messages
        sock.ev.on('messages.upsert', async (msg) => {
            try {
                await handleCommands(sock, msg, number);
            } catch (e) {
                console.error(e);
            }
        });
    });
}

startBot();