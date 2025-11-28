// index.js
/**
 * TUNZY-MD-V1 Katabumb Bot
 * Owner: Tunzy Shop
 * WhatsApp: +2349067345425
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const ownerNumber = '+2349067345425';
const ownerName = 'Tunzy Shop';
const authFolder = './auth_info';
const mediaFolder = './media';
const channelLink = 'https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04';
const githubLink = 'https://github.com/tunzy-shop/TUNZY-MD-V1';

let antilinkMode = 'off';
let warnCount = {};

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
        if (connection === 'open') console.log('✅ Connected to WhatsApp successfully!');
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        const isOwner = msg.key.participant?.includes(ownerNumber) || from.includes(ownerNumber);

        const command = text.toLowerCase().split(' ')[0];
        const args = text.split(' ').slice(1);

        // ---------------- ANTI-LINK ----------------
        if (antilinkMode !== 'off' && msg.message?.conversation) {
            const linkRegex = /https?:\/\/\S+/i;
            if (linkRegex.test(msg.message.conversation)) {
                if (!isOwner) {
                    if (antilinkMode === 'delete') {
                        await sock.sendMessage(from, { text: `⚠️ Link detected! Message deleted.\nChannel: ${channelLink}` });
                    } else if (antilinkMode === 'kick') {
                        try {
                            const userJid = msg.key.participant || msg.key.remoteJid;
                            await sock.groupRemove(from, [userJid]);
                            await sock.sendMessage(from, { text: `❌ User removed for posting link!\nChannel: ${channelLink}` });
                        } catch {}
                    } else if (antilinkMode.startsWith('warn')) {
                        const user = msg.key.participant || msg.key.remoteJid;
                        warnCount[user] = (warnCount[user] || 0) + 1;
                        await sock.sendMessage(from, { text: `⚠️ Warning ${warnCount[user]}/3 for posting link!\nChannel: ${channelLink}` });
                        if (warnCount[user] >= 3) {
                            try {
                                await sock.groupRemove(from, [user]);
                                await sock.sendMessage(from, { text: `❌ User removed after 3 warnings!\nChannel: ${channelLink}` });
                                warnCount[user] = 0;
                            } catch {}
                        }
                    }
                }
            }
        }

        // ---------------- COMMANDS ----------------
        switch (command) {
            // -------- PUBLIC COMMANDS --------
            case '.ping':
                await sock.sendMessage(from, { text: 'Pong! 🏓\nChannel: ' + channelLink });
                break;

            case '.menu':
                const menuText = `
♣ PUBLIC COMMANDS
_________________________
.ping - Ping the bot
.menu - Show this menu
.public - Set public mode
.private - Set owner-only mode
.repo - Show GitHub repo
.owner - Show owner contact

♣ GROUP COMMANDS
_________________________
.anticall - Anti-call (admin)
.tagall - Tag all members (admin)
.tag - Tag single member (admin)
.hidetag - Hide tag (admin)
.add - Add member by number (admin)
.kick - Kick member by number (admin)
.accept all - Accept all pending members (admin)
.antilink - Antilink settings (admin)
.mode - Set mode public/private (admin)

♣ MEDIA COMMANDS
_________________________
.menu - Bot menu with image
.hd - High-quality image
.vv - Image command
.vv2 - Video/voice command
.play <song> - Play music

Owner: Tunzy Shop (+2349067345425)
Channel: ${channelLink}
                `;
                try {
                    const buffer = fs.readFileSync(path.join(mediaFolder, 'botpic.jpeg'));
                    await sock.sendMessage(from, { image: buffer, caption: menuText });
                } catch {
                    await sock.sendMessage(from, { text: menuText });
                }
                break;

            // -------- MEDIA COMMANDS --------
            case '.hd':
                if (fs.existsSync(path.join(mediaFolder, 'hd.jpeg'))) {
                    const buffer = fs.readFileSync(path.join(mediaFolder, 'hd.jpeg'));
                    await sock.sendMessage(from, { image: buffer, caption: `High-quality image\nChannel: ${channelLink}` });
                } else await sock.sendMessage(from, { text: `⚠️ hd.jpeg not found!\nChannel: ${channelLink}` });
                break;

            case '.vv':
                if (fs.existsSync(path.join(mediaFolder, 'vv.jpeg'))) {
                    const buffer = fs.readFileSync(path.join(mediaFolder, 'vv.jpeg'));
                    await sock.sendMessage(from, { image: buffer, caption: `Image from .vv\nChannel: ${channelLink}` });
                } else await sock.sendMessage(from, { text: `⚠️ vv.jpeg not found!\nChannel: ${channelLink}` });
                break;

            case '.vv2':
                if (fs.existsSync(path.join(mediaFolder, 'vv2.mp4'))) {
                    const buffer = fs.readFileSync(path.join(mediaFolder, 'vv2.mp4'));
                    await sock.sendMessage(from, { video: buffer, caption: `Video from .vv2\nChannel: ${channelLink}` });
                } else if (fs.existsSync(path.join(mediaFolder, 'vv2.mp3'))) {
                    const buffer = fs.readFileSync(path.join(mediaFolder, 'vv2.mp3'));
                    await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg', ptt: true });
                } else await sock.sendMessage(from, { text: `⚠️ vv2.mp4 or vv2.mp3 not found!\nChannel: ${channelLink}` });
                break;

            // -------- ADMIN / OWNER COMMANDS --------
            case '.anticall':
            case '.tagall':
            case '.tag':
            case '.hidetag':
            case '.add':
            case '.kick':
            case '.accept':
            case '.antilink':
            case '.mode':
                if (!isOwner) return sock.sendMessage(from, { text: `⚠️ This command is for admin only.\nChannel: ${channelLink}` });

                // Add
                if (command === '.add') {
                    if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Provide a number to add!\nChannel: ' + channelLink });
                    const number = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
                    try { await sock.groupAdd(from, [number]); await sock.sendMessage(from, { text: `✅ Added ${args[0]}!\nChannel: ${channelLink}` }); }
                    catch { await sock.sendMessage(from, { text: `❌ Failed to add ${args[0]}!\nChannel: ${channelLink}` }); }
                }

                // Kick
                if (command === '.kick') {
                    if (!args[0]) return sock.sendMessage(from, { text: '⚠️ Provide a number to kick!\nChannel: ' + channelLink });
                    const number = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
                    try { await sock.groupRemove(from, [number]); await sock.sendMessage(from, { text: `✅ Kicked ${args[0]}!\nChannel: ${channelLink}` }); }
                    catch { await sock.sendMessage(from, { text: `❌ Failed to kick ${args[0]}!\nChannel: ${channelLink}` }); }
                }

                // Tagall
                if (command === '.tagall') {
                    try {
                        const groupMeta = await sock.groupMetadata(from);
                        const participants = groupMeta.participants.map(p => p.id);
                        const textTag = '♣ Tag All Members\n_________________________\n';
                        await sock.sendMessage(from, { text: textTag, mentions: participants });
                    } catch { await sock.sendMessage(from, { text: `❌ Failed to tag all members.\nChannel: ${channelLink}` }); }
                }

                // .antilink
                if (command === '.antilink') {
                    const option = args.join(' ');
                    if (!option) return sock.sendMessage(from, { text: `⚠️ Options: set delete | set kick | set warn 3 | off\nChannel: ${channelLink}` });
                    if (option === 'set delete') antilinkMode = 'delete';
                    else if (option === 'set kick') antilinkMode = 'kick';
                    else if (option === 'set warn 3') antilinkMode = 'warn3';
                    else if (option === 'off') antilinkMode = 'off';
                    await sock.sendMessage(from, { text: `⚡ Antilink mode: ${antilinkMode}\nChannel: ${channelLink}` });
                }
                break;

            // -------- PUBLIC / PRIVATE --------
            case '.public':
                await sock.sendMessage(from, { text: `♣ Public Mode\n_________________________\nNow available for everyone.\nChannel: ${channelLink}` });
                break;

            case '.private':
                if (!isOwner) return sock.sendMessage(from, { text: `⚠️ Only owner can use this command.\nChannel: ${channelLink}` });
                await sock.sendMessage(from, { text: `♣ Private Mode\n_________________________\nOnly owner can use commands now.\nChannel: ${channelLink}` });
                break;

            // -------- REPO --------
            case '.repo':
                await sock.sendMessage(from, { text: `♣ Repository\n_________________________\nGitHub: ${githubLink}\nFollow my channel: ${channelLink}` });
                break;

            // -------- OWNER CONTACT --------
            case '.owner':
                await sock.sendMessage(from, {
                    contacts: [{ displayName: ownerName, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+','')}:+${ownerNumber}\nEND:VCARD` }]
                });
                break;

            // -------- PLAY MUSIC --------
            case '.play':
                if (!args.length) return sock.sendMessage(from, { text: `⚠️ Provide a song name!\nExample: .play zazu\nChannel: ${channelLink}` });

                const query = args.join(' ');
                try {
                    const searchUrl = `https://api.vevioz.com/music/search?q=${encodeURIComponent(query)}`;
                    const res = await fetch(searchUrl);
                    const data = await res.json();
                    if (!data || !data.result || data.result.length === 0)
                        return sock.sendMessage(from, { text: `❌ No results for ${query}\nChannel: ${channelLink}` });

                    const song = data.result[0];
                    const audioResp = await fetch(song.url);
                    const audioBuffer = Buffer.from(await audioResp.arrayBuffer());

                    const thumbResp = await fetch(song.thumbnail);
                    const thumbBuffer = Buffer.from(await thumbResp.arrayBuffer());

                    await sock.sendMessage(from, { image: thumbBuffer, caption: `♣ Play\n_________________________\n🎵 ${song.title}\nChannel: ${channelLink}` });
                    await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true });
                } catch (e) {
                    await sock.sendMessage(from, { text: `❌ Failed to play music: ${e.message}\nChannel: ${channelLink}` });
                }
                break;

            default: break;
        }
    });
}

startBot();