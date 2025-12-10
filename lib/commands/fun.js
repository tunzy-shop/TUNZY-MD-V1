module.exports = {
    // Compliment someone
    async compliment(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .compliment @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const compliments = [
            "You're an amazing person! 🌟",
            "Your smile brightens up the room! 😊",
            "You're incredibly talented! 💫",
            "You have a great sense of humor! 😂",
            "You're smarter than you think! 🧠",
            "You're doing a great job! 👍",
            "You're one of a kind! 🌈",
            "You make the world better! 🌍"
        ];
        
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💝 *Compliment*\n\nTo: @${user.split('@')[0]}\n\n${randomCompliment}`,
            mentions: [user]
        });
    },
    
    // Insult someone (playful)
    async insult(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .insult @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const insults = [
            "You're as useful as a chocolate teapot! 🍫",
            "You're not the sharpest tool in the shed! 🔧",
            "You're a few sandwiches short of a picnic! 🥪",
            "You're about as bright as a black hole! 🌌",
            "You're slower than a snail in quicksand! 🐌",
            "You're more confused than a chameleon in a bag of skittles! 🦎",
            "You're about as useful as a screen door on a submarine! 🚪",
            "You're crazier than a bag of cats! 🐱"
        ];
        
        const randomInsult = insults[Math.floor(Math.random() * insults.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `😜 *Playful Insult*\n\nTo: @${user.split('@')[0]}\n\n${randomInsult}\n\nJust kidding! 😉`,
            mentions: [user]
        });
    },
    
    // Flirt
    async flirt(sock, msg, args) {
        const flirts = [
            "Are you a magician? Because whenever I look at you, everyone else disappears! ✨",
            "Do you have a map? I keep getting lost in your eyes! 🗺️",
            "Is your name Google? Because you have everything I've been searching for! 🔍",
            "Are you made of copper and tellurium? Because you're Cu-Te! ⚗️",
            "Do you believe in love at first sight, or should I walk by again? 👀",
            "If you were a vegetable, you'd be a cute-cumber! 🥒",
            "Are you a parking ticket? Because you've got FINE written all over you! 🅿️",
            "Do you have a Band-Aid? Because I just scraped my knee falling for you! 🩹"
        ];
        
        const randomFlirt = flirts[Math.floor(Math.random() * flirts.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💘 *Flirt*\n\n${randomFlirt}`
        });
    },
    
    // Shayari
    async shayari(sock, msg, args) {
        const shayaris = [
            "Teri muskurahat mein hai chamak aisi,\nJaise sitaron se utre hain kisi ne roshni barsayi! ✨",
            "Dil ki dhadkan ban gaye ho tum,\nHar lamha tumhare sath bitana chahta hun! 💓",
            "Tere bina adhoora hai mera jahan,\nTu hai meri duniya ka sabse khubsurat samaan! 🌍",
            "Mohabbat ki yeh dastaan likh di maine,\nTere naam se har safha saja di maine! 📖",
            "Teri yaadon mein kho jaata hun main,\nJaise sagar mein lehr jaata hun main! 🌊"
        ];
        
        const randomShayari = shayaris[Math.floor(Math.random() * shayaris.length)];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `📜 *Shayari*\n\n${randomShayari}`
        });
    },
    
    // Good night
    async goodnight(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🌙 *Good Night*\n\nMay your dreams be filled with joy and happiness!\nSleep tight and sweet dreams! ✨\n\nGood night from TUNZY MD! 💤`
        });
    },
    
    // Rose day
    async roseday(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🌹 *Rose Day Special*\n\nA red rose for love,\nA yellow rose for friendship,\nA pink rose for admiration,\nA white rose for purity,\nAnd all of them for you!\n\nHappy Rose Day! 💝`
        });
    },
    
    // Character analysis
    async character(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .character @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const traits = ['Kind', 'Funny', 'Smart', 'Creative', 'Helpful', 'Adventurous', 'Loyal', 'Brave'];
        const randomTraits = [...traits].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔮 *Character Analysis*\n\nFor: @${user.split('@')[0]}\n\nTraits:\n${randomTraits.map(t => `• ${t}`).join('\n')}\n\nCompatibility: Excellent! 🌟`,
            mentions: [user]
        });
    },
    
    // Wasted effect
    async wasted(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .wasted @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💀 *WASTED*\n\n@${user.split('@')[0]} got wasted! 🍺\n\nGTA Style! 🚗💥`,
            mentions: [user]
        });
    },
    
    // Ship two users
    async ship(sock, msg, args) {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentions.length < 2) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention two users\nExample: .ship @user1 @user2"
            });
            return;
        }
        
        const user1 = mentions[0];
        const user2 = mentions[1];
        const percentage = Math.floor(Math.random() * 101);
        
        let shipStatus = '';
        if (percentage >= 90) shipStatus = 'Perfect Match! 💖';
        else if (percentage >= 70) shipStatus = 'Great Compatibility! 😍';
        else if (percentage >= 50) shipStatus = 'Good Match! 😊';
        else if (percentage >= 30) shipStatus = 'Maybe Not... 🤔';
        else shipStatus = 'Not Compatible 😅';
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💑 *Ship Test*\n\n@${user1.split('@')[0]} ❤️ @${user2.split('@')[0]}\n\nCompatibility: ${percentage}%\nStatus: ${shipStatus}`,
            mentions: [user1, user2]
        });
    },
    
    // Simp rating
    async simp(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .simp @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const rating = Math.floor(Math.random() * 101);
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `😍 *Simp Rating*\n\n@${user.split('@')[0]}\n\nSimp Level: ${rating}%\n${rating >= 80 ? 'Ultra Simp! 🥵' : rating >= 50 ? 'Moderate Simp 😏' : 'Not a Simp 😎'}`,
            mentions: [user]
        });
    },
    
    // Stupid rating
    async stupid(sock, msg, args) {
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .stupid @user"
            });
            return;
        }
        
        const user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const rating = Math.floor(Math.random() * 101);
        const text = args.slice(1).join(' ') || 'No comment provided';
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🤪 *Stupid Rating*\n\n@${user.split('@')[0]}\n\nStupid Level: ${rating}%\nComment: ${text}\n${rating >= 80 ? 'Ultra Stupid! 🤯' : rating >= 50 ? 'Pretty Stupid 😜' : 'Not Stupid 😇'}`,
            mentions: [user]
        });
    }
};
