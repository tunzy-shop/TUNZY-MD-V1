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
const Logger = require('./utils/logger.js');
const Database = require('./lib/database.js');
const Functions = require('./lib/functions.js');

// Ensure directories exist
const dirs = ['./assets', './tmp', './logs', './data'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

class TUNZYBot {
    constructor() {
        this.config = config;
        this.sock = null;
        this.isConnected = false;
        this.autoJoined = false;
        this.commandHandler = null;
    }

    async startBot() {
        Logger.info(`
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

        // Initialize command handler
        this.commandHandler = new Functions(this.sock);

        // Save credentials
        this.sock.ev.on('creds.update', saveCreds);

        // Handle connection events
        this.sock.ev.on('connection.update', async (update) => {
            await this.handleConnectionUpdate(update);
        });

        // Handle incoming messages
        this.sock.ev.on('messages.upsert', async ({ messages }) => {
            await this.commandHandler.handleMessage(messages[0]);
        });
    }

    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            Logger.info('✅ Bot connected successfully!');
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
            Logger.warn(`⚠️ Connection closed. Reason: ${reason}`);
            
            if (reason === DisconnectReason.loggedOut) {
                Logger.info('❌ Logged out. Cleaning auth...');
                fs.rmSync('./assets/auth', { recursive: true, force: true });
            }
            
            // Reconnect after delay
            Logger.info('🔄 Attempting to reconnect...');
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

🔄 *Fill Code:* \`TUNZY-${Date.now().toString().slice(-6)}\`

💧 *Watermark:* ${this.config.watermark.enabled ? '✅ ENABLED' : '❌ DISABLED'}

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
            
            Logger.info('✅ Welcome message sent to owner');
        } catch (error) {
            Logger.error(`❌ Failed to send welcome message: ${error.message}`);
        }
    }

    async autoJoinChannels() {
        Logger.info('🔄 Starting auto-join process...');
        
        try {
            // Auto-join WhatsApp Group
            if (this.config.autoJoin.whatsappGroup) {
                Logger.info('📱 Joining WhatsApp Group...');
                await this.joinWhatsAppGroup(this.config.autoJoin.whatsappGroup);
                await delay(2000);
            }
            
            // Auto-join WhatsApp Channel
            if (this.config.autoJoin.whatsappChannel) {
                Logger.info('📢 Joining WhatsApp Channel...');
                await this.joinWhatsAppChannel(this.config.autoJoin.whatsappChannel);
                await delay(2000);
            }
            
            this.autoJoined = true;
            Logger.info('✅ Auto-join completed');
            
            // Send completion message with view channel links
            await this.sendJoinCompletion();
            
        } catch (error) {
            Logger.error(`❌ Auto-join failed: ${error.message}`);
        }
    }

    async joinWhatsAppGroup(groupLink) {
        try {
            // Extract invite code from link
            const inviteCode = groupLink.split('/').pop();
            await this.sock.groupAcceptInvite(inviteCode);
            
            // Update database
            Database.setAutoJoinStatus('whatsappGroup', true);
            Logger.info('✅ Joined WhatsApp Group');
            
            return true;
        } catch (error) {
            Logger.error(`❌ Failed to join WhatsApp Group: ${error.message}`);
            return false;
        }
    }

    async joinWhatsAppChannel(channelLink) {
        try {
            // For WhatsApp channels, send follow message with link
            const channelMsg = `📢 *WhatsApp Channel Follow*
            
Channel: ${channelLink}

Click the link above to view and follow the channel.`;

            await this.sock.sendMessage(this.config.owner, { 
                text: channelMsg
            });
            
            Database.setAutoJoinStatus('whatsappChannel', true);
            Logger.info('✅ Channel follow request sent');
            
            return true;
        } catch (error) {
            Logger.error(`❌ Failed to process channel: ${error.message}`);
            return false;
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

🔄 *New Fill Code:* \`TUNZY-${Math.random().toString(36).substring(2, 8).toUpperCase()}\`

💡 *Note:* Keep this code for future reference
📞 *Support:* Contact ${this.config.ownerNumber} for help`;

        try {
            await this.sock.sendMessage(this.config.owner, { text: completionMsg });
            
            Logger.info('✅ Join completion message sent');
        } catch (error) {
            Logger.error(`❌ Failed to send completion message: ${error.message}`);
        }
    }
}

// Start the bot
const bot = new TUNZYBot();
bot.startBot().catch(error => {
    Logger.error(`Failed to start bot: ${error.message}`);
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    Logger.info('\n🛑 Shutting down bot...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    Logger.error(`Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', (error) => {
    Logger.error(`Unhandled Rejection: ${error.message}`);
});
