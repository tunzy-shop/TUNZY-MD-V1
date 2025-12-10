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
