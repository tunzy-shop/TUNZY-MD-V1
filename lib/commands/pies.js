const axios = require('axios');

module.exports = {
    // Random pies from country
    async pies(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a country\nExample: .pies japan\nAvailable: japan, korean, indonesia, china, hijab"
            });
            return;
        }
        
        const country = args[0].toLowerCase();
        const countries = ['japan', 'korean', 'indonesia', 'china', 'hijab'];
        
        if (!countries.includes(country)) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Invalid country. Available: ${countries.join(', ')}`
            });
            return;
        }
        
        try {
            // Using random image API (example)
            const urls = {
                japan: 'https://source.unsplash.com/500x500/?japanese,anime',
                korean: 'https://source.unsplash.com/500x500/?korean,model',
                indonesia: 'https://source.unsplash.com/500x500/?indonesian,woman',
                china: 'https://source.unsplash.com/500x500/?chinese,beauty',
                hijab: 'https://source.unsplash.com/500x500/?hijab,muslim'
            };
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: urls[country] },
                caption: `🌹 *${country.charAt(0).toUpperCase() + country.slice(1)} Pies*\n\nCountry: ${country}\nRequested by: ${msg.key.participant?.split('@')[0] || 'User'}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error loading ${country} pies: ${error.message}`
            });
        }
    },
    
    // Japanese pies
    async japan(sock, msg, args) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'https://source.unsplash.com/500x500/?japanese,anime,beauty' },
                caption: "🌸 *Japanese Pies*\n\nEnjoy the beauty of Japan!"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error loading Japanese pies"
            });
        }
    },
    
    // Korean pies
    async korean(sock, msg, args) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'https://source.unsplash.com/500x500/?korean,model,kpop' },
                caption: "🇰🇷 *Korean Pies*\n\nKorean beauty standards!"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error loading Korean pies"
            });
        }
    },
    
    // Indonesian pies
    async indonesia(sock, msg, args) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'https://source.unsplash.com/500x500/?indonesian,woman,beauty' },
                caption: "🇮🇩 *Indonesian Pies*\n\nBeautiful Indonesian women!"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error loading Indonesian pies"
            });
        }
    },
    
    // Chinese pies
    async china(sock, msg, args) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'https://source.unsplash.com/500x500/?chinese,beauty,asian' },
                caption: "🇨🇳 *Chinese Pies*\n\nChinese elegance and beauty!"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error loading Chinese pies"
            });
        }
    },
    
    // Hijab pies
    async hijab(sock, msg, args) {
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: 'https://source.unsplash.com/500x500/?hijab,muslim,modest' },
                caption: "🧕 *Hijab Pies*\n\nModest and beautiful!"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Error loading hijab pies"
            });
        }
    }
};
