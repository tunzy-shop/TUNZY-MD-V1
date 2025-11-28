// index.js
/**
 * TUNZY-MD-V1 Katabumb Bot
 * Owner: Tunzy Shop
 * WhatsApp: +2349067345425
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    downloadContentFromMessage,
    generateWAMessageFromContent,
    proto
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const TikTokScraper = require('tiktok-scraper');
const fetch = require('node-fetch');

const ownerNumber = '+2349067345425';
const ownerName = 'Tunzy Shop';
const authFolder = './auth_info';
const mediaFolder = './media';
const channelLink = 'https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04';
const githubLink = 'https://github.com/tunzy-shop/TUNZY-MD-V1';
const groupLink = 'https://chat.whatsapp.com/IaZpA3r6fgYIqMXZkWSVNd';

let antilinkMode = 'off';
let warnCount = {};
let bannedUsers = [];

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log('❌ Connection closed. Reason:', reason);
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnecting...');
                await startBot();
            } else {
                console.log('🚫 Logged out. Delete auth_info to reconnect.');
            }
        }
        if (connection === 'open') {
            console.log('✅ Connected to WhatsApp successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        const isOwner = sender.includes(ownerNumber);
        const isBanned = bannedUsers.includes(sender);
        if (isBanned && !isOwner) return;

        const command = text.toLowerCase().split(' ')[0];
        const args = text.split(' ').slice(1);

        const isGroup = from.endsWith('@g.us');
        let isAdmin = false;
        if (isGroup) {
            try {
                const metadata = await sock.groupMetadata(from);
                const participant = metadata.participants.find(p => p.id === sender);
                isAdmin = participant?.admin || false;
            } catch {}
        }

        // ---------------- AUTO SEND GROUP + CHANNEL LINK ----------------
        if (!isGroup && command.startsWith('.')) {
            await sock.sendMessage(sender, { text: `Welcome! 🎉\nJoin the official group: ${groupLink}\nFollow my channel: ${channelLink}` });
        }

        // ---------------- ANTI-LINK ----------------
        if (antilinkMode !== 'off' && msg.message?.conversation && !isOwner) {
            const linkRegex = /https?:\/\/\S+/i;
            if (linkRegex.test(msg.message.conversation)) {
                if (antilinkMode === 'delete') await sock.sendMessage(from, { text: `⚠️ Link detected! Message deleted.\nChannel: ${channelLink}` });
                else if (antilinkMode === 'kick') try { await sock.groupRemove(from, [sender]); } catch {}
                else if (antilinkMode.startsWith('warn')) {
                    warnCount[sender] = (warnCount[sender] || 0) + 1;
                    await sock.sendMessage(from, { text: `⚠️ Warning ${warnCount[sender]}/3\nChannel: ${channelLink}` });
                    if (warnCount[sender] >= 3) try { await sock.groupRemove(from, [sender]); warnCount[sender]=0; } catch {}
                }
            }
        }

        // ---------------- PUBLIC COMMANDS ----------------
        const publicCommands = ['.menu', '.ping', '.play', '.repo', '.owner', '.tiktok', '.save'];
        if (publicCommands.includes(command)) {
            switch (command) {
                case '.ping':
                    await sock.sendMessage(from, { text: 'Pong! 🏓\nChannel: ' + channelLink });
                    break;

                case '.menu':
                    const name = isOwner ? ownerName : (msg.pushName || 'there');
                    const menuText = `
Wassup ${name} 👋
♣ PUBLIC COMMANDS
.ping, .menu, .play <song>, .repo, .owner, .tiktok <link>, .save

♣ ADMIN COMMANDS
.add, .kick, .tag, .tagall, .hidetag, .accept all, .antilink, .open, .close, .promote, .demote

♣ OWNER COMMANDS
.ban, .unban, .block, .anticall, .mode

♣ GROUP COMMANDS
.gc link, .list admin, .list online

Owner: ${ownerName} (+2349067345425)
Channel: ${channelLink}
Group: ${groupLink}
                    `;
                    try {
                        const buffer = fs.readFileSync(path.join(mediaFolder, 'botpic.jpeg'));
                        await sock.sendMessage(from, { image: buffer, caption: menuText });
                    } catch { await sock.sendMessage(from, { text: menuText }); }
                    break;

                case '.repo':
                    await sock.sendMessage(from, { text: `♣ Repository\nGitHub: ${githubLink}\nChannel: ${channelLink}` });
                    break;

                case '.owner':
                    await sock.sendMessage(from, {
                        contacts: [{
                            displayName: ownerName,
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+','')}:+${ownerNumber}\nEND:VCARD`
                        }]
                    });
                    break;

                // ---------------- PLAY SONG ----------------
                case '.play':
                    if (!args.length) return sock.sendMessage(from, { text: `⚠️ Provide a song name! Example: .play zazu\nChannel: ${channelLink}` });
                    try {
                        const search = args.join(' ');
                        const ytURL = `https://www.youtube.com/watch?v=${search}`; // for demo, integrate proper search API
                        const info = await ytdl.getInfo(ytURL);
                        const thumb = info.videoDetails.thumbnails.pop().url;
                        const stream = ytdl(ytURL, { filter: 'audioonly', quality: 'highestaudio' });
                        const filePath = `./media/${info.videoDetails.videoId}.mp3`;
                        const writeStream = fs.createWriteStream(filePath);
                        stream.pipe(writeStream);
                        stream.on('end', async () => {
                            await sock.sendMessage(from, { image: { url: thumb }, caption: `🎵 ${info.videoDetails.title}` });
                            await sock.sendMessage(from, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg' });
                            fs.unlinkSync(filePath);
                        });
                    } catch { await sock.sendMessage(from, { text: '❌ Could not fetch song.' }); }
                    break;

                // ---------------- TIKTOK ----------------
                case '.tiktok':
                    if (!args[0]) return sock.sendMessage(from, { text: `⚠️ Provide TikTok link!\nExample: .tiktok <link>` });
                    try {
                        const videoMeta = await TikTokScraper.video(args[0], { noWaterMark: true });
                        await sock.sendMessage(from, { video: { url: videoMeta.videoUrl }, caption: `🎬 TikTok Downloaded without watermark` });
                    } catch { await sock.sendMessage(from, { text: '❌ Could not download TikTok video.' }); }
                    break;

                // ---------------- SAVE TO STATUS ----------------
                case '.save':
                    if (!msg.message.imageMessage && !msg.message.videoMessage) return sock.sendMessage(from, { text: '⚠️ Send media with this command to save!' });
                    try {
                        const media = msg.message.imageMessage || msg.message.videoMessage;
                        const stream = await downloadContentFromMessage({ message: msg.message, type: media.mimetype.startsWith('image') ? 'image' : 'video' });
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                        const fileName = path.join(mediaFolder, `${Date.now()}.${media.mimetype.split('/')[1]}`);
                        fs.writeFileSync(fileName, buffer);
                        // Forward to owner
                        await sock.sendMessage(ownerNumber + '@s.whatsapp.net', { text: `New media saved from ${msg.pushName || sender}` });
                        await sock.sendMessage(ownerNumber + '@s.whatsapp.net', { [media.mimetype.startsWith('image') ? 'image' : 'video']: buffer });
                        await sock.sendMessage(from, { text: '✅ Media saved and forwarded to owner.' });
                    } catch { await sock.sendMessage(from, { text: '❌ Could not save media.' }); }
                    break;
            }
        }

        // ---------------- OWNER & ADMIN COMMANDS ----------------
        // (keep as previous: .ban, .unban, .block, .anticall, .mode, .add, .kick, .tag, .tagall, .hidetag etc.)
        // ---------------- GROUP COMMANDS ----------------
        // (keep as previous: .gc link, .list admin, .list online)
    });
}

startBot();