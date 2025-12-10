const fs = require('fs');
const path = require('path');
const config = require('../../config.js');

module.exports = {
    // Check if user is owner
    isOwner(jid) {
        return jid === config.owner;
    },
    
    // Change bot mode
    async mode(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `Current mode: ${config.mode}\nUsage: .mode <public/self>`
            });
            return;
        }
        
        const mode = args[0].toLowerCase();
        if (mode === 'public' || mode === 'self') {
            config.mode = mode;
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ Bot mode changed to: ${mode}`
            });
        } else {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Invalid mode. Use: public or self"
            });
        }
    },
    
    // Clear session
    async clearsession(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        try {
            if (fs.existsSync('./assets/auth')) {
                fs.rmSync('./assets/auth', { recursive: true, force: true });
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "✅ Session cleared. Bot will restart with new QR code."
                });
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "✅ No session data found."
                });
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Clear temporary files
    async cleartmp(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        try {
            const tmpDir = './tmp';
            if (fs.existsSync(tmpDir)) {
                const files = fs.readdirSync(tmpDir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(tmpDir, file));
                });
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ Cleared ${files.length} temporary files.`
                });
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "✅ No temporary files found."
                });
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Update bot
    async update(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🔄 Update feature would check for updates here\n(This is a simulation)"
        });
    },
    
    // Show settings
    async settings(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚙️ *Bot Settings*\n\n` +
                  `*Name:* ${config.name}\n` +
                  `*Version:* ${config.version}\n` +
                  `*Mode:* ${config.mode}\n` +
                  `*Prefix:* ${config.prefix}\n` +
                  `*Owner:* ${config.ownerNumber}\n` +
                  `*Watermark:* ${config.watermark.enabled ? '✅ ON' : '❌ OFF'}\n` +
                  `*Auto-Join:* ${config.features.autoJoin ? '✅ ON' : '❌ OFF'}\n` +
                  `*Auto-Read:* ${config.features.autoRead ? '✅ ON' : '❌ OFF'}\n` +
                  `*Anti-Delete:* ${config.features.antiDelete ? '✅ ON' : '❌ OFF'}`
        });
    },
    
    // Set profile picture
    async setpp(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        if (!msg.message?.imageMessage) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please reply to an image\nExample: Reply to image with .setpp"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🖼️ Profile picture would be updated here\n(This is a simulation)"
        });
    },
    
    // Auto-react toggle
    async autoreact(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.autoReact = !config.features.autoReact;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Auto-react ${config.features.autoReact ? 'enabled' : 'disabled'}`
        });
    },
    
    // Auto-status
    async autostatus(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📱 Auto-status feature would be configured here\n(This is a simulation)"
        });
    },
    
    // Auto-read toggle
    async autoread(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.autoRead = !config.features.autoRead;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Auto-read ${config.features.autoRead ? 'enabled' : 'disabled'}`
        });
    },
    
    // Auto-typing toggle
    async autotyping(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.autoTyping = !config.features.autoTyping;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Auto-typing ${config.features.autoTyping ? 'enabled' : 'disabled'}`
        });
    },
    
    // Anti-call toggle
    async anticall(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.antiCall = !config.features.antiCall;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Anti-call ${config.features.antiCall ? 'enabled' : 'disabled'}`
        });
    },
    
    // PM blocker toggle
    async pmblocker(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.pmBlocker = !config.features.pmBlocker;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ PM blocker ${config.features.pmBlocker ? 'enabled' : 'disabled'}`
        });
    },
    
    // Set mention reply
    async setmention(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        if (!msg.message?.extendedTextMessage?.text) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please reply to a message\nExample: Reply to message with .setmention"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "💬 Mention reply would be set here\n(This is a simulation)"
        });
    },
    
    // Test mention
    async mention(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🔔 Mention test would trigger here\n(This is a simulation)"
        });
    },
    
    // Anti-delete toggle
    async antidelete(sock, msg, args) {
        const userJid = msg.key.participant || msg.key.remoteJid;
        
        if (!this.isOwner(userJid)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command is for owner only!"
            });
            return;
        }
        
        config.features.antiDelete = !config.features.antiDelete;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Anti-delete ${config.features.antiDelete ? 'enabled' : 'disabled'}`
        });
    }
};
