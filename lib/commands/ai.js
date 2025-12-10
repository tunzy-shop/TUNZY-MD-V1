const axios = require('axios');
const config = require('../../config.js');

module.exports = {
    // GPT chat
    async gpt(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a question\nExample: .gpt What is AI?"
            });
            return;
        }
        
        const question = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🤖 *ChatGPT*\n\nQuestion: ${question}\n\nAnswer: This feature requires OpenAI API key.\nAdd your API key in config.js to enable AI features.`
        });
    },
    
    // Gemini AI
    async gemini(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a question\nExample: .gemini Explain quantum physics"
            });
            return;
        }
        
        const question = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔮 *Gemini AI*\n\nQuestion: ${question}\n\nAnswer: This feature requires Google Gemini API key.\nAdd your API key in config.js to enable AI features.`
        });
    },
    
    // AI Image generation
    async imagine(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a prompt\nExample: .imagine a beautiful sunset over mountains"
            });
            return;
        }
        
        const prompt = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎨 *AI Image Generation*\n\nPrompt: ${prompt}\n\nStatus: This feature requires DALL-E or Stable Diffusion API.\nAdd your API key in config.js to enable AI image generation.`
        });
    },
    
    // Flux AI
    async flux(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a prompt\nExample: .flux futuristic city at night"
            });
            return;
        }
        
        const prompt = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚡ *Flux AI*\n\nPrompt: ${prompt}\n\nStatus: Flux AI image generation requires API key.\nContact owner for setup.`
        });
    },
    
    // Sora video generation
    async sora(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a prompt\nExample: .sora a cat playing piano"
            });
            return;
        }
        
        const prompt = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎥 *Sora Video AI*\n\nPrompt: ${prompt}\n\nStatus: Sora video generation is not publicly available yet.\nThis feature will be added when available.`
        });
    }
};
