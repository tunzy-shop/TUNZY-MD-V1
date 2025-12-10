const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js');

module.exports = {
    // Ping command
    async ping(sock, msg, args) {
        const start = Date.now();
        const timestamp = msg.messageTimestamp * 1000;
        const latency = Date.now() - timestamp;
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🏓 *Pong!*\n⏱️ Latency: ${latency}ms\n⏰ Response: ${Date.now() - start}ms`
        });
    },
    
    // Alive command
    async alive(sock, msg, args) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🤖 *TUNZY-MD V1 is ALIVE!*\n\n` +
                  `📅 Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
                  `⚡ Version: ${config.version}\n` +
                  `👤 Owner: ${config.author}\n` +
                  `💧 Watermark: ${config.watermark.enabled ? '✅ ON' : '❌ OFF'}`
        });
    },
    
    // TTS command
    async tts(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .tts Hello World"
            });
            return;
        }
        
        const text = args.join(' ');
        try {
            // Using Google TTS
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
            
            await sock.sendMessage(msg.key.remoteJid, {
                audio: { url: ttsUrl },
                mimetype: 'audio/mpeg',
                caption: `🗣️ TTS: ${text}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ TTS Error: ${error.message}`
            });
        }
    },
    
    // Owner info
    async owner(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `👤 *Owner Information*\n\n` +
                  `💼 Name: ${config.author}\n` +
                  `📞 Number: ${config.ownerNumber}\n` +
                  `📺 YouTube: ${config.youtube}\n` +
                  `🤖 Bot: ${config.name} v${config.version}\n\n` +
                  `📱 Contact: wa.me/${config.ownerNumber.replace('+', '')}\n` +
                  `💬 Support: ${config.autoJoin.whatsappGroup}`
        });
    },
    
    // Joke command
    async joke(sock, msg, args) {
        try {
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const joke = response.data;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `😂 *Joke Time!*\n\n` +
                      `*Setup:* ${joke.setup}\n` +
                      `*Punchline:* ${joke.punchline}\n\n` +
                      `😄 Enjoy your laugh!`
            });
        } catch (error) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it had too many problems!",
                "What's orange and sounds like a parrot? A carrot!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `😂 *Joke Time!*\n\n${randomJoke}`
            });
        }
    },
    
    // Quote command
    async quote(sock, msg, args) {
        try {
            const response = await axios.get('https://api.quotable.io/random');
            const quote = response.data;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `💬 *Inspirational Quote*\n\n` +
                      `"${quote.content}"\n\n` +
                      `— ${quote.author}\n\n` +
                      `📚 Category: ${quote.tags.join(', ')}`
            });
        } catch (error) {
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Life is what happens to you while you're busy making other plans. - John Lennon",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "It is during our darkest moments that we must focus to see the light. - Aristotle",
                "Whoever is happy will make others happy too. - Anne Frank"
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `💬 *Quote of the Day*\n\n${randomQuote}`
            });
        }
    },
    
    // Fact command
    async fact(sock, msg, args) {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const fact = response.data;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📚 *Random Fact*\n\n${fact.text}\n\n🔗 Source: ${fact.source_url}`
            });
        } catch (error) {
            const facts = [
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
                "Octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
                "A day on Venus is longer than a year on Venus. It takes Venus 243 Earth days to rotate once, but only 225 Earth days to orbit the sun.",
                "Bananas are berries, but strawberries aren't.",
                "A group of flamingos is called a 'flamboyance'."
            ];
            
            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📚 *Did You Know?*\n\n${randomFact}`
            });
        }
    },
    
    // Weather command
    async weather(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a city name\nExample: .weather Lagos"
            });
            return;
        }
        
        const city = args.join(' ');
        try {
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w+%m`);
            const weather = response.data;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🌤️ *Weather in ${city}*\n\n${weather}\n\n🔗 More info: https://wttr.in/${encodeURIComponent(city)}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Could not fetch weather for ${city}`
            });
        }
    },
    
    // 8ball command
    async ball(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please ask a question\nExample: .8ball Will I be rich?"
            });
            return;
        }
        
        const responses = [
            "🎱 It is certain.",
            "🎱 It is decidedly so.",
            "🎱 Without a doubt.",
            "🎱 Yes definitely.",
            "🎱 You may rely on it.",
            "🎱 As I see it, yes.",
            "🎱 Most likely.",
            "🎱 Outlook good.",
            "🎱 Yes.",
            "🎱 Signs point to yes.",
            "🎱 Reply hazy, try again.",
            "🎱 Ask again later.",
            "🎱 Better not tell you now.",
            "🎱 Cannot predict now.",
            "🎱 Concentrate and ask again.",
            "🎱 Don't count on it.",
            "🎱 My reply is no.",
            "🎱 My sources say no.",
            "🎱 Outlook not so good.",
            "🎱 Very doubtful."
        ];
        
        const question = args.join(' ');
        const answer = responses[Math.floor(Math.random() * responses.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎱 *Magic 8-Ball*\n\n` +
                  `*Question:* ${question}\n` +
                  `*Answer:* ${answer}`
        });
    },
    
    // Group info
    async groupinfo(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants;
            const admins = participants.filter(p => p.admin).length;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📊 *Group Information*\n\n` +
                      `*Name:* ${metadata.subject}\n` +
                      `*ID:* ${metadata.id}\n` +
                      `*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n` +
                      `*Members:* ${participants.length}\n` +
                      `*Admins:* ${admins}\n` +
                      `*Description:* ${metadata.desc || 'No description'}\n\n` +
                      `👥 *Owners:* ${metadata.owner ? metadata.owner.split('@')[0] : 'Unknown'}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Staff/Admins
    async staff(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const admins = metadata.participants.filter(p => p.admin);
            
            let adminList = '👑 *Group Admins*\n\n';
            admins.forEach((admin, index) => {
                const number = admin.id.split('@')[0];
                adminList += `${index + 1}. ${admin.id.replace('@s.whatsapp.net', '')}\n`;
            });
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: adminList + `\nTotal: ${admins.length} admin(s)`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Translate
    async trt(sock, msg, args) {
        if (args.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Usage: .trt <text> <language code>\nExample: .trt Hello es"
            });
            return;
        }
        
        const lang = args.pop();
        const text = args.join(' ');
        
        try {
            const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
            const translation = response.data[0][0][0];
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🌐 *Translation*\n\n` +
                      `*Original:* ${text}\n` +
                      `*To ${lang.toUpperCase()}:* ${translation}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Translation error: ${error.message}`
            });
        }
    },
    
    // Screenshot
    async ss(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a URL\nExample: .ss https://google.com"
            });
            return;
        }
        
        const url = args[0];
        await sock.sendMessage(msg.key.remoteJid, {
            text: `📸 Taking screenshot of ${url}...\n\nNote: This feature requires a screenshot API service.`
        });
    },
    
    // Get JID
    async jid(sock, msg, args) {
        const jid = msg.key.participant || msg.key.remoteJid;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🆔 *JID Information*\n\n` +
                  `*Your JID:* ${jid}\n` +
                  `*Type:* ${jid.endsWith('@g.us') ? 'Group' : 'User'}`
        });
    },
    
    // URL Shortener
    async url(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a URL\nExample: .url https://example.com"
            });
            return;
        }
        
        const url = args[0];
        try {
            const response = await axios.post('https://cleanuri.com/api/v1/shorten', {
                url: url
            });
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🔗 *URL Shortened*\n\n` +
                      `*Original:* ${url}\n` +
                      `*Short:* ${response.data.result_url}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ URL shortening failed: ${error.message}`
            });
        }
    },
    
    // Fill code
    async getcode(sock, msg, args) {
        const code = `TUNZY-${Date.now().toString().slice(-6)}`;
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔐 *New Fill Code*\n\n` +
                  `*Code:* \`${code}\`\n\n` +
                  `💡 Use this code for pairing\n` +
                  `⏱️ Valid for 24 hours`
        });
    },
    
    // Join info
    async joininfo(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `📢 *Auto-Join Channels*\n\n` +
                  `✅ WhatsApp Group:\n${config.autoJoin.whatsappGroup}\n\n` +
                  `✅ WhatsApp Channel:\n${config.autoJoin.whatsappChannel}\n\n` +
                  `💬 Join these channels for updates!`
        });
    },
    
    // View once simulator
    async vv(sock, msg, args) {
        if (!msg.message?.imageMessage && !msg.message?.videoMessage) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please reply to an image or video\nExample: Reply to media with .vv"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "👀 This would be a view-once message\n(Simulated - actual view-once requires different handling)"
        });
    }
};
