// index.js
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const { state, saveState } = useSingleFileAuthState('./tmp/session.json');
const { getCommandsMenu } = require('./lib/functions');
const { database, saveDB } = require('./lib/database');
const { ownerNumber, botName, channelLink, groupLink, prefix } = require('./config');

async function start() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const client = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        version
    });

    client.ev.on('messages.upsert', async m => {
        try {
            if (!m.messages[0].message) return;
            const msg = m.messages[0];
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const sender = msg.key.remoteJid;
            const fromGroup = sender.endsWith('@g.us');

            // ANTI-LINK SYSTEM
            if (fromGroup && database.antilink.includes(sender) && text.match(/(https?:\/\/chat.whatsapp.com\/\S+)/gi)) {
                if (!msg.key.fromMe) {
                    client.groupRemove(sender, [msg.participant]);
                    client.sendMessage(sender, { text: `🚫 ${msg.participant.split('@')[0]} was removed for posting a link!` });
                }
            }

            // COMMAND HANDLER
            if (!text.startsWith(prefix)) return;
            const [cmd, ...args] = text.slice(prefix.length).trim().split(/ +/);

            // PUBLIC COMMANDS
            if (cmd === 'ping') client.sendMessage(sender, { text: 'Pong!' });
            if (cmd === 'menu') {
                const menuText = getCommandsMenu(sender);
                client.sendMessage(sender, { text: menuText });
            }
            if (cmd === 'play') client.sendMessage(sender, { text: `Playing: ${args.join(' ')}` });
            if (cmd === 'repo') client.sendMessage(sender, { text: 'https://github.com/YourRepo' });
            if (cmd === 'owner') client.sendMessage(sender, { text: `Owner: ${ownerNumber}` });
            if (cmd === 'tiktok') client.sendMessage(sender, { text: `Downloading TikTok: ${args.join(' ')}` });
            if (cmd === 'save') client.sendMessage(sender, { text: 'Feature not added yet!' });

            // ADMIN COMMANDS
            if (fromGroup && msg.key.fromMe === false) {
                if (cmd === 'add') client.groupParticipantsUpdate(sender, [args[0] + '@s.whatsapp.net'], 'add');
                if (cmd === 'kick') client.groupParticipantsUpdate(sender, [args[0] + '@s.whatsapp.net'], 'remove');
                if (cmd === 'tag') client.sendMessage(sender, { text: `@${args[0]} `, mentions: [args[0] + '@s.whatsapp.net'] });
                if (cmd === 'tagall') {
                    const mems = await client.groupMetadata(sender).then(x => x.participants.map(u => u.id));
                    client.sendMessage(sender, { text: 'Tag All!', mentions: mems });
                }
                if (cmd === 'hidetag') {
                    client.sendMessage(sender, { text: args.join(' '), mentions: [] });
                }
                if (cmd === 'accept') client.sendMessage(sender, { text: 'All accepted' });
                if (cmd === 'antilink') {
                    if (!database.antilink.includes(sender)) database.antilink.push(sender);
                    saveDB();
                    client.sendMessage(sender, { text: 'Antilink is now active!' });
                }
                if (cmd === 'open') client.groupSettingUpdate(sender, 'not_announcement');
                if (cmd === 'close') client.groupSettingUpdate(sender, 'announcement');
                if (cmd === 'promote') client.groupParticipantsUpdate(sender, [args[0] + '@s.whatsapp.net'], 'promote');
                if (cmd === 'demote') client.groupParticipantsUpdate(sender, [args[0] + '@s.whatsapp.net'], 'demote');
            }

            // OWNER COMMANDS
            if (sender === ownerNumber + '@s.whatsapp.net') {
                if (cmd === 'ban') client.sendMessage(sender, { text: 'User banned!' });
                if (cmd === 'unban') client.sendMessage(sender, { text: 'User unbanned!' });
                if (cmd === 'block') client.updateBlockStatus(args[0] + '@s.whatsapp.net', 'block');
                if (cmd === 'anticall') client.sendMessage(sender, { text: 'Anti-call activated!' });
                if (cmd === 'mode') client.sendMessage(sender, { text: 'Mode changed!' });
            }

            // GROUP COMMANDS
            if (fromGroup) {
                if (cmd === 'gc') client.sendMessage(sender, { text: `Group link: ${groupLink}` });
                if (cmd === 'list') {
                    if (args[0] === 'admin') {
                        const mems = await client.groupMetadata(sender).then(x => x.participants.filter(u => u.admin));
                        client.sendMessage(sender, { text: `Admins:\n${mems.map(u => u.id).join('\n')}` });
                    }
                    if (args[0] === 'online') client.sendMessage(sender, { text: 'Online list not implemented' });
                }
            }

        } catch (e) {
            console.log(chalk.red(e));
        }
    });

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                start();
            } else {
                console.log(chalk.red('You are logged out. Delete tmp/session.json and restart.'));
            }
        } else if (connection === 'open') {
            console.log(chalk.green(`Bot ${botName} connected!`));
        }
    });

    client.ev.on('creds.update', saveState);
}

start();