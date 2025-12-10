const fs = require('fs');
const path = require('path');
const config = require('../config.js');

class Helpers {
    // Format text with watermark
    static formatText(text) {
        if (config.watermark.enabled) {
            return `${text}\n\n${config.watermark.text}`;
        }
        return text;
    }
    
    // Add watermark to message
    static addWatermark(message) {
        if (config.watermark.enabled && message.text) {
            message.text = Helpers.formatText(message.text);
        }
        return message;
    }
    
    // Generate random code
    static generateCode(prefix = "TUNZY") {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
    
    // Check if user is owner
    static isOwner(jid) {
        return jid === config.owner;
    }
    
    // Check if user is admin
    static async isAdmin(sock, jid, userJid) {
        try {
            const groupMetadata = await sock.groupMetadata(jid);
            const participants = groupMetadata.participants;
            const admin = participants.filter(p => 
                p.id === userJid && (p.admin === 'admin' || p.admin === 'superadmin')
            );
            return admin.length > 0;
        } catch {
            return false;
        }
    }
    
    // Extract text from message
    static extractText(msg) {
        if (!msg.message) return '';
        
        if (msg.message.conversation) {
            return msg.message.conversation;
        }
        if (msg.message.extendedTextMessage?.text) {
            return msg.message.extendedTextMessage.text;
        }
        if (msg.message.imageMessage?.caption) {
            return msg.message.imageMessage.caption;
        }
        if (msg.message.videoMessage?.caption) {
            return msg.message.videoMessage.caption;
        }
        return '';
    }
    
    // Download media
    static async downloadMedia(sock, message, filename) {
        try {
            const type = Object.keys(message)[0];
            const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            const filepath = path.join('./tmp', filename);
            fs.writeFileSync(filepath, buffer);
            return filepath;
        } catch (error) {
            console.error('Download error:', error);
            return null;
        }
    }
    
    // Format time
    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    // Clean temporary files
    static cleanTmp() {
        const tmpDir = './tmp';
        if (fs.existsSync(tmpDir)) {
            fs.readdirSync(tmpDir).forEach(file => {
                fs.unlinkSync(path.join(tmpDir, file));
            });
        }
    }
    
    // Create directory if not exists
    static ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    // Get command arguments
    static parseArgs(text) {
        const args = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (char === '"' || char === "'") {
                inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    args.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        
        if (current) {
            args.push(current);
        }
        
        return args;
    }
}

module.exports = Helpers;