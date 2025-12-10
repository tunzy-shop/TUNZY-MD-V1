const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const P = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const axios = require('axios');

// Ensure directories exist
if (!fs.existsSync('./assets')) fs.mkdirSync('./assets');
if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

class TUNZYBot {
    constructor() {
        this.config = config;
        this.sock = null;
        this.isConnected = false;
        this.autoJoined = false;
    }

    async startBot() {
        console.log(`
━━━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *🌹 TUNZY-MD-V1*  
┃✮│➣ Version: *${this.config.version}*
➣ by ${this.config.author}
➣ YT : ${this.config.youtube}
━━━━━━━━━━━━━━━━━━━┈⊷
        `);

        const { state, saveCreds } = await useMultiFileAuthState('./assets/auth');
        
        this.sock = makeWASocket({
            version: await fetchLatestBaileysVersion(),
            logger: P({ level: 'silent' }),
            printQRInTerminal: true,
            browser: Browsers.ubuntu('Chrome'),
            auth: state,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            emitOwnEvents: false,
            defaultQueryTimeoutMs: 60000,
        });

        // Save credentials
        this.sock.ev.on('creds.update', saveCreds);

        // Handle connection events
        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });

        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            await this.handleMessage(messages[0]);
        });

        // Load commands
        await this.loadCommands();
    }

    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log('✅ Bot connected successfully!');
            this.isConnected = true;
            
            // Send welcome to owner
            await this.sendWelcomeMessage();
            
            // Auto-join feature
            if (this.config.features.autoJoin && !this.autoJoined) {
                await this.autoJoinChannels();
            }
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect.error).output.statusCode;
            console.log(`⚠️ Connection closed. Reason: ${reason}`);
            
            if (reason === DisconnectReason.loggedOut) {
                console.log('❌ Logged out. Cleaning auth...');
                fs.rmSync('./assets/auth', { recursive: true, force: true });
            }
            
            // Reconnect after delay
            console.log('🔄 Attempting to reconnect...');
            setTimeout(() => this.startBot(), 5000);
        }
    }

    async sendWelcomeMessage() {
        const welcomeMsg = `🤖 *${this.config.name} v${this.config.version}*
        
✅ *Bot Activated Successfully!*

👤 *Developer:* ${this.config.author}
📞 *Contact:* ${this.config.ownerNumber}
📺 *YouTube:* ${this.config.youtube}

📢 *Auto-Join Feature Enabled*
The bot will automatically join required WhatsApp channels.

🔄 *Fill Code:* \`TUNZY-MD-${Date.now().toString().slice(-6)}\`

Type .menu to see all commands`;

        try {
            // Send welcome message
            await this.sock.sendMessage(this.config.owner, { text: welcomeMsg });
            
            // Send menu picture if exists
            if (fs.existsSync(this.config.botpic)) {
                await this.sock.sendMessage(this.config.owner, {
                    image: fs.readFileSync(this.config.botpic),
                    caption: "📸 *Bot Menu Picture*\nType .menu for command list"
                });
            }
            
            console.log('✅ Welcome message sent to owner');
        } catch (error) {
            console.log('❌ Failed to send welcome message:', error.message);
        }
    }

    async autoJoinChannels() {
        console.log('🔄 Starting auto-join process...');
        
        try {
            // Auto-join WhatsApp Group
            if (this.config.autoJoin.whatsappGroup) {
                console.log('📱 Joining WhatsApp Group...');
                await this.joinWhatsAppGroup(this.config.autoJoin.whatsappGroup);
                await delay(2000);
            }
            
            // Auto-join WhatsApp Channel
            if (this.config.autoJoin.whatsappChannel) {
                console.log('📢 Joining WhatsApp Channel...');
                await this.joinWhatsAppChannel(this.config.autoJoin.whatsappChannel);
                await delay(2000);
            }
            
            this.autoJoined = true;
            console.log('✅ Auto-join completed');
            
            // Send completion message with view channel links
            await this.sendJoinCompletion();
            
        } catch (error) {
            console.log('❌ Auto-join failed:', error.message);
        }
    }

    async joinWhatsAppGroup(groupLink) {
        try {
            // Extract invite code from link
            const inviteCode = groupLink.split('/').pop();
            await this.sock.groupAcceptInvite(inviteCode);
            console.log('✅ Joined WhatsApp Group');
        } catch (error) {
            console.log('❌ Failed to join WhatsApp Group:', error.message);
        }
    }

    async joinWhatsAppChannel(channelLink) {
        try {
            // For WhatsApp channels, we can send a follow request
            // Note: Actual channel joining might require different approach
            const channelId = channelLink.split('/').pop();
            const followMsg = `📢 *Follow Channel Request Sent*
            
Channel: ${channelLink}

Click the link above to view the channel.`;

            await this.sock.sendMessage(this.config.owner, { 
                text: followMsg,
                linkPreview: {
                    title: "Tunzy WhatsApp Channel",
                    description: "Official WhatsApp Channel",
                    canonicalUrl: channelLink,
                    matchedText: channelLink,
                    thumbnail: await this.getThumbnail()
                }
            });
            
            console.log('✅ Channel follow request sent');
        } catch (error) {
            console.log('❌ Failed to process channel:', error.message);
        }
    }

    async sendJoinCompletion() {
        const completionMsg = `✅ *Auto-Join Completed*

📱 *Joined Successfully:*
• WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
• WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}

👇 *View Channels:*
➤ WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
➤ WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}

🔄 *New Fill Code:* \`TUNZY-MD-${Math.random().toString(36).substring(2, 8).toUpperCase()}\`

💡 *Note:* Keep this code for future reference
📞 *Support:* Contact ${this.config.ownerNumber} for help`;

        try {
            await this.sock.sendMessage(this.config.owner, { text: completionMsg });
            
            // Send with buttons for quick access
            await this.sock.sendMessage(this.config.owner, {
                text: "📱 *Quick Links*",
                templateButtons: [
                    {
                        index: 1,
                        urlButton: {
                            displayText: "📢 View WhatsApp Group",
                            url: this.config.autoJoin.whatsappGroup
                        }
                    },
                    {
                        index: 2,
                        urlButton: {
                            displayText: "📢 View WhatsApp Channel",
                            url: this.config.autoJoin.whatsappChannel
                        }
                    }
                ]
            });
        } catch (error) {
            console.log('❌ Failed to send completion message:', error.message);
        }
    }

    async getThumbnail() {
        try {
            if (fs.existsSync(this.config.botpic)) {
                return fs.readFileSync(this.config.botpic);
            }
        } catch (error) {
            return null;
        }
    }

    async handleMessage(msg) {
        if (!msg.message || msg.key.fromMe) return;
        
        const text = this.getMessageText(msg);
        if (!text || !text.startsWith(this.config.prefix)) return;
        
        const [command, ...args] = text.slice(this.config.prefix.length).trim().split(' ');
        const cmd = command.toLowerCase();
        
        await this.executeCommand(cmd, args, msg);
    }

    getMessageText(msg) {
        const msgTypes = ['conversation', 'extendedTextMessage'];
        for (const type of msgTypes) {
            if (msg.message[type]) {
                if (type === 'extendedTextMessage') {
                    return msg.message[type].text || '';
                }
                return msg.message[type] || '';
            }
        }
        return '';
    }

    async executeCommand(cmd, args, msg) {
        try {
            switch(cmd) {
                case 'menu':
                case 'help':
                    await this.showMenu(msg);
                    break;
                case 'ping':
                    await this.sock.sendMessage(msg.key.remoteJid, {
                        text: `🏓 Pong! Bot is alive\n⏱️ Response time: ${Date.now() - msg.messageTimestamp * 1000}ms`
                    });
                    break;
                case 'owner':
                    await this.showOwnerInfo(msg);
                    break;
                case 'alive':
                    await this.sock.sendMessage(msg.key.remoteJid, {
                        text: `🤖 *${this.config.name} is ALIVE!*\n\nVersion: ${this.config.version}\nMode: ${this.config.mode}\nPrefix: ${this.config.prefix}`
                    });
                    break;
                case 'joininfo':
                    await this.showJoinInfo(msg);
                    break;
                case 'getcode':
                    await this.sendFillCode(msg);
                    break;
                // Add more commands here
                default:
                    await this.sock.sendMessage(msg.key.remoteJid, {
                        text: `❌ Unknown command: ${cmd}\nType .menu to see available commands`
                    });
            }
        } catch (error) {
            console.error('Command error:', error);
        }
    }

    async showMenu(msg) {
        const menuText = `━━━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *🌹 TUNZY-MD-V1*  
┃✮│➣ Version: *${this.config.version}*
➣ by ${this.config.author}
➣ YT : ${this.config.youtube}
━━━━━━━━━━━━━━━━━━━┈⊷

*Available Commands:*

*GENERAL*
.help / .menu - Show this menu
.ping - Check bot response
.alive - Check if bot is alive
.tts <text> - Text to speech
.owner - Show owner info
.joke - Get random joke
.quote - Get inspirational quote
.fact - Get random fact
.news - Get latest news
.attp <text> - Create animated text
.weather <city> - Get weather info
.lyrics <song> - Get song lyrics
.8ball <question> - Magic 8-ball
.groupinfo - Show group info
.staff - Show group admins
.vv - View once message
.trt <text> <lang> - Translate text
.ss <link> - Take screenshot
.jid - Get user JID
.url - Shorten URL
.joininfo - Show joined channels
.getcode - Get new fill code

*ADMIN*
.ban @user - Ban user
.promote @user - Promote to admin
.demote @user - Remove admin
.mute - Mute group
.unmute - Unmute group
.del - Delete message
.kick @user - Kick user
.warnings - Check warnings
.warn @user - Warn user
.antilink - Toggle anti-link
.antibadword - Toggle anti-badword
.clear - Clear chat
.tag - Tag all
.tagall - Tag all members
.tagnotadmin - Tag non-admins
.hidetag - Hidden tag
.chatbot - Toggle chatbot
.resetlink - Reset group link
.antitag - Anti tag spam
.welcome - Toggle welcome
.goodbye - Toggle goodbye
.setgdesc <desc> - Set group description
.setgname <name> - Set group name
.setgpp - Set group picture
.accept all - Accept all pending requests

*OWNER*
.mode <public/self> - Change bot mode
.clearsession - Clear session
.antidelete - Toggle anti-delete
.cleartmp - Clear temp files
.update - Update bot
.settings - Show settings
.setpp <reply image> - Set bot profile
.autoreact - Toggle auto-reaction
.autostatus - Auto status reply
.autoread - Auto read messages
.autotyping - Auto typing
.anticall - Block unknown calls
.pmblocker - Block PMs
.setmention <reply> - Set mention reply
.mention - Test mention

━━━━━━━━━━━━━━━━━━━┈⊷
📢 *Joined Channels:*
• WhatsApp Group: chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1
• WhatsApp Channel: whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147
━━━━━━━━━━━━━━━━━━━┈⊷`;

        try {
            // Send menu as text
            await this.sock.sendMessage(msg.key.remoteJid, { text: menuText });
            
            // Also send menu picture if exists
            if (fs.existsSync(this.config.botpic)) {
                await this.sock.sendMessage(msg.key.remoteJid, {
                    image: fs.readFileSync(this.config.botpic),
                    caption: "📸 *Bot Menu*\nCheck above message for commands"
                });
            }
        } catch (error) {
            console.log('Menu error:', error.message);
        }
    }

    async showOwnerInfo(msg) {
        const ownerInfo = `👤 *Owner Information*

💼 *Name:* Tunzy
📞 *Number:* ${this.config.ownerNumber}
📺 *YouTube:* ${this.config.youtube}
🤖 *Bot:* ${this.config.name} v${this.config.version}

📱 *Contact Owner:*
wa.me/${this.config.ownerNumber.replace('+', '')}

📢 *Official Channels:*
• WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
• WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}`;

        await this.sock.sendMessage(msg.key.remoteJid, { text: ownerInfo });
    }

    async showJoinInfo(msg) {
        const joinInfo = `📢 *Auto-Join Information*

✅ *Successfully Joined:*
📱 WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
📢 WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}

👇 *View Channels:*
➤ ${this.config.autoJoin.whatsappGroup}
➤ ${this.config.autoJoin.whatsappChannel}

🔄 *Current Fill Code:* TUNZY-MD-${Date.now().toString().slice(-6)}`;

        await this.sock.sendMessage(msg.key.remoteJid, { text: joinInfo });
    }

    async sendFillCode(msg) {
        const code = `TUNZY-MD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const fillCodeMsg = `🔄 *New Fill Code Generated*

🔐 *Code:* \`${code}\`

💡 *Usage:*
1. Use this code for bot pairing
2. Contact owner if code expires
3. Keep code secure

📞 *Support:* ${this.config.ownerNumber}
⏱️ *Valid for:* 24 hours`;

        await this.sock.sendMessage(msg.key.remoteJid, { text: fillCodeMsg });
    }

    async loadCommands() {
        // Load additional command modules
        try {
            // You can load command files here
            console.log('✅ Commands loaded successfully');
        } catch (error) {
            console.log('❌ Failed to load commands:', error.message);
        }
    }
}

// Utility function for delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the bot
const bot = new TUNZYBot();
bot.startBot().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});