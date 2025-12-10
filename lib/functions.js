const fs = require('fs');
const path = require('path');
const config = require('../config.js');
const Helpers = require('../utils/helpers.js');
const Logger = require('../utils/logger.js');
const Watermark = require('../utils/watermark.js');
const Database = require('./database.js');
const Constants = require('../utils/constants.js');

class Functions {
    constructor(sock) {
        this.sock = sock;
        this.config = config;
        this.commands = new Map();
        this.loadCommands();
    }
    
    loadCommands() {
        const commandsDir = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsDir)) {
            fs.mkdirSync(commandsDir, { recursive: true });
            this.createDefaultCommandFiles(commandsDir);
            return;
        }
        
        // Load all command files
        const commandFiles = fs.readdirSync(commandsDir);
        
        commandFiles.forEach(file => {
            if (file.endsWith('.js')) {
                try {
                    const commandModule = require(path.join(commandsDir, file));
                    Object.entries(commandModule).forEach(([name, handler]) => {
                        this.commands.set(name, handler);
                    });
                } catch (error) {
                    Logger.error(`Failed to load ${file}: ${error.message}`);
                }
            }
        });
    }
    
    createDefaultCommandFiles(commandsDir) {
        // Create default command files
        const defaultCommands = {
            'general.js': require('./commands/general.js'),
            'admin.js': require('./commands/admin.js'),
            'owner.js': require('./commands/owner.js')
        };
        
        Object.entries(defaultCommands).forEach(([filename, content]) => {
            fs.writeFileSync(
                path.join(commandsDir, filename),
                `module.exports = ${JSON.stringify(content, null, 2)}`
            );
        });
    }
    
    async handleMessage(msg) {
        if (!msg.message || msg.key.fromMe) return;
        
        const text = Helpers.extractText(msg);
        if (!text || !text.startsWith(this.config.prefix)) return;
        
        const [command, ...args] = text.slice(this.config.prefix.length).trim().split(' ');
        const cmd = command.toLowerCase();
        
        // Log command usage
        const user = msg.key.participant || msg.key.remoteJid;
        Logger.logCommand(user, cmd, args);
        Database.incrementCommand(user);
        Database.incrementCommandCount();
        
        // Update user last seen
        Database.updateUser(user, { lastSeen: Date.now() });
        
        // Execute command
        await this.executeCommand(cmd, args, msg);
    }
    
    async executeCommand(cmd, args, msg) {
        try {
            // Check for built-in commands first
            switch(cmd) {
                case 'menu':
                case 'help':
                    await this.showMenu(msg);
                    break;
                case 'ping':
                    await this.pingCommand(msg);
                    break;
                case 'owner':
                    await this.ownerCommand(msg);
                    break;
                case 'alive':
                    await this.aliveCommand(msg);
                    break;
                case 'joininfo':
                    await this.joinInfoCommand(msg);
                    break;
                case 'getcode':
                    await this.getCodeCommand(msg);
                    break;
                case 'stats':
                    await this.statsCommand(msg);
                    break;
                case 'watermark':
                    await this.watermarkCommand(msg, args);
                    break;
                default:
                    // Check loaded commands
                    if (this.commands.has(cmd)) {
                        await this.commands.get(cmd)(this.sock, msg, args, this.config);
                    } else {
                        await this.sendMessage(msg.key.remoteJid, {
                            text: Watermark.createWatermarkedText(
                                `❌ Command not found: ${cmd}\nType .menu for available commands`
                            )
                        });
                    }
            }
        } catch (error) {
            Logger.error(`Command ${cmd} error: ${error.message}`);
            await this.sendMessage(msg.key.remoteJid, {
                text: Watermark.createWatermarkedText(`❌ Error: ${error.message}`)
            });
        }
    }
    
    async showMenu(msg) {
        const menuText = Watermark.createWatermarkedText(`
━━━━━━━━━━━━━━━━━━━━┈⊷
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
.stats - Show bot statistics
.watermark - Toggle watermark

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
• WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
• WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}
━━━━━━━━━━━━━━━━━━━┈⊷
        `);
        
        try {
            // Send menu text
            await this.sendMessage(msg.key.remoteJid, { text: menuText });
            
            // Send menu picture if exists
            if (fs.existsSync(this.config.botpic)) {
                const imageBuffer = fs.readFileSync(this.config.botpic);
                
                // Add watermark to image
                const watermarkedImage = path.join('./tmp', `menu-${Date.now()}.jpg`);
                if (this.config.watermark.enabled) {
                    await Watermark.addToImage(this.config.botpic, watermarkedImage);
                    await this.sendMessage(msg.key.remoteJid, {
                        image: fs.readFileSync(watermarkedImage),
                        caption: "📸 *Bot Menu*\nCheck above message for commands"
                    });
                    fs.unlinkSync(watermarkedImage);
                } else {
                    await this.sendMessage(msg.key.remoteJid, {
                        image: imageBuffer,
                        caption: "📸 *Bot Menu*\nCheck above message for commands"
                    });
                }
            }
        } catch (error) {
            Logger.error(`Menu error: ${error.message}`);
        }
    }
    
    async pingCommand(msg) {
        const start = Date.now();
        const latency = Date.now() - (msg.messageTimestamp * 1000);
        
        const pingText = Watermark.createWatermarkedText(`
🏓 *PONG!*
⚡ *Bot Latency:* ${latency}ms
🔄 *Response Time:* ${Date.now() - start}ms
📊 *Uptime:* ${Helpers.formatTime(Date.now() - Database.getStats().startTime)}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: pingText });
    }
    
    async ownerCommand(msg) {
        const ownerText = Watermark.createWatermarkedText(`
👤 *Owner Information*

💼 *Name:* ${this.config.author}
📞 *Number:* ${this.config.ownerNumber}
📺 *YouTube:* ${this.config.youtube}
🤖 *Bot:* ${this.config.name} v${this.config.version}

📱 *Contact Owner:*
wa.me/${this.config.ownerNumber.replace('+', '')}

📢 *Official Channels:*
• WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
• WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: ownerText });
    }
    
    async aliveCommand(msg) {
        const stats = Database.getStats();
        const aliveText = Watermark.createWatermarkedText(`
🤖 *${this.config.name} is ALIVE!*

📊 *Statistics:*
• Version: ${this.config.version}
• Mode: ${this.config.mode}
• Prefix: ${this.config.prefix}
• Commands: ${stats.totalCommands}
• Users: ${Object.keys(Database.data.users || {}).length}
• Uptime: ${Helpers.formatTime(Date.now() - stats.startTime)}
• Watermark: ${this.config.watermark.enabled ? '✅ ON' : '❌ OFF'}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: aliveText });
    }
    
    async joinInfoCommand(msg) {
        const joinInfo = Database.getAutoJoinStatus();
        const joinText = Watermark.createWatermarkedText(`
📢 *Auto-Join Information*

✅ *Status:*
📱 WhatsApp Group: ${joinInfo.whatsappGroup ? '✅ Joined' : '❌ Not Joined'}
📢 WhatsApp Channel: ${joinInfo.whatsappChannel ? '✅ Joined' : '❌ Not Joined'}

👇 *View Channels:*
➤ ${this.config.autoJoin.whatsappGroup}
➤ ${this.config.autoJoin.whatsappChannel}

🔄 *Last Attempt:* ${new Date(joinInfo.lastJoinAttempt).toLocaleString()}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: joinText });
    }
    
    async getCodeCommand(msg) {
        const code = Helpers.generateCode('TUNZY');
        const codeText = Watermark.createWatermarkedText(`
🔄 *New Fill Code Generated*

🔐 *Code:* \`${code}\`

💡 *Usage:*
1. Use this code for bot pairing
2. Contact owner if code expires
3. Keep code secure

📞 *Support:* ${this.config.ownerNumber}
⏱️ *Valid for:* 24 hours

*Watermark Status:* ${this.config.watermark.enabled ? 'ENABLED' : 'DISABLED'}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: codeText });
    }
    
    async statsCommand(msg) {
        const stats = Database.getStats();
        const userCount = Object.keys(Database.data.users || {}).length;
        const groupCount = Object.keys(Database.data.groups || {}).length;
        
        const statsText = Watermark.createWatermarkedText(`
📊 *Bot Statistics*

🤖 *Bot Info:*
• Name: ${this.config.name}
• Version: ${this.config.version}
• Prefix: ${this.config.prefix}
• Mode: ${this.config.mode}

📈 *Usage Stats:*
• Total Commands: ${stats.totalCommands}
• Total Users: ${userCount}
• Total Groups: ${groupCount}
• Uptime: ${Helpers.formatTime(Date.now() - stats.startTime)}

🔧 *Features:*
• Auto-Join: ${this.config.features.autoJoin ? '✅' : '❌'}
• Watermark: ${this.config.watermark.enabled ? '✅' : '❌'}
• Auto-Read: ${this.config.features.autoRead ? '✅' : '❌'}
        `);
        
        await this.sendMessage(msg.key.remoteJid, { text: statsText });
    }
    
    async watermarkCommand(msg, args) {
        if (!Helpers.isOwner(msg.key.participant || msg.key.remoteJid)) {
            await this.sendMessage(msg.key.remoteJid, {
                text: Watermark.createWatermarkedText(Constants.ERRORS.NOT_OWNER)
            });
            return;
        }
        
        if (args[0] === 'on') {
            this.config.watermark.enabled = true;
            await this.sendMessage(msg.key.remoteJid, {
                text: Watermark.createWatermarkedText('✅ Watermark enabled!')
            });
        } else if (args[0] === 'off') {
            this.config.watermark.enabled = false;
            await this.sendMessage(msg.key.remoteJid, {
                text: '❌ Watermark disabled!'
            });
        } else {
            await this.sendMessage(msg.key.remoteJid, {
                text: Watermark.createWatermarkedText(
                    `💧 *Watermark Settings*\n\n` +
                    `Status: ${this.config.watermark.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n` +
                    `Text: ${this.config.watermark.text}\n` +
                    `Position: ${this.config.watermark.position}\n` +
                    `Usage: .watermark on/off`
                )
            });
        }
    }
    
    async sendMessage(jid, content) {
        try {
            // Add watermark to text messages
            if (content.text && this.config.watermark.enabled) {
                content.text = Watermark.createWatermarkedText(content.text);
            }
            
            await this.sock.sendMessage(jid, content);
        } catch (error) {
            Logger.error(`Send message error: ${error.message}`);
        }
    }
    
    // Auto-join handler
    async handleAutoJoin() {
        if (!this.config.features.autoJoin) return;
        
        Logger.info('Starting auto-join process...');
        
        try {
            // Join WhatsApp Group
            if (this.config.autoJoin.whatsappGroup) {
                await this.joinWhatsAppGroup();
            }
            
            // Join WhatsApp Channel
            if (this.config.autoJoin.whatsappChannel) {
                await this.joinWhatsAppChannel();
            }
            
            // Send completion message
            await this.sendAutoJoinCompletion();
            
        } catch (error) {
            Logger.error(`Auto-join failed: ${error.message}`);
        }
    }
    
    async joinWhatsAppGroup() {
        try {
            const inviteCode = this.config.autoJoin.whatsappGroup.split('/').pop();
            await this.sock.groupAcceptInvite(inviteCode);
            Database.setAutoJoinStatus('whatsappGroup', true);
            Logger.info('✅ Joined WhatsApp Group');
        } catch (error) {
            Logger.error(`❌ Failed to join WhatsApp Group: ${error.message}`);
        }
    }
    
    async joinWhatsAppChannel() {
        try {
            // For channels, we send a follow message
            const channelMsg = Watermark.createWatermarkedText(`
📢 *WhatsApp Channel Follow*

Channel: ${this.config.autoJoin.whatsappChannel}

Click the link above to view and follow the channel.
            `);
            
            await this.sendMessage(this.config.owner, { text: channelMsg });
            Database.setAutoJoinStatus('whatsappChannel', true);
            Logger.info('✅ Channel follow request sent');
        } catch (error) {
            Logger.error(`❌ Failed to process channel: ${error.message}`);
        }
    }
    
    async sendAutoJoinCompletion() {
        const completionMsg = Watermark.createWatermarkedText(`
✅ *Auto-Join Completed!*

📱 *Joined Successfully:*
• WhatsApp Group: ${this.config.autoJoin.whatsappGroup}
• WhatsApp Channel: ${this.config.autoJoin.whatsappChannel}

👇 *View Channels:*
➤ ${this.config.autoJoin.whatsappGroup}
➤ ${this.config.autoJoin.whatsappChannel}

🔄 *New Fill Code:* \`${Helpers.generateCode('TUNZY')}\`

💡 *Note:* Keep this code for future reference
📞 *Support:* Contact ${this.config.ownerNumber} for help
        `);
        
        await this.sendMessage(this.config.owner, { text: completionMsg });
    }
}

module.exports = Functions;