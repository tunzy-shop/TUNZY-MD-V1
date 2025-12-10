module.exports = {
    // Metalic text
    async metalic(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .metalic TUNZY MD"
            });
            return;
        }
        
        const text = args.join(' ');
        const metalicText = `🔶 *Metalic Text*\n\n` +
                           `⚜️ ${text} ⚜️\n\n` +
                           `✨ Text style: Metalic\n` +
                           `🎨 Color: Silver/Gold\n` +
                           `💎 Effect: Shiny`;
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: metalicText
        });
    },
    
    // Ice text
    async ice(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .ice COOL"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `❄️ *Ice Text*\n\n🧊 ${text} 🧊\n\nCool as ice!`
        });
    },
    
    // Snow text
    async snow(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .snow WINTER"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🌨️ *Snow Text*\n\n☃️ ${text} ☃️\n\nLet it snow!`
        });
    },
    
    // Impressive text
    async impressive(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .impressive WOW"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🌟 *Impressive Text*\n\n✨ ${text} ✨\n\nVery impressive!`
        });
    },
    
    // Matrix text
    async matrix(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .matrix CODE"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🟢 *Matrix Text*\n\n${text.split('').join(' ')}\n\nFollow the white rabbit... 🐇`
        });
    },
    
    // Light text
    async light(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .light BRIGHT"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💡 *Light Text*\n\n🔆 ${text} 🔆\n\nShining bright!`
        });
    },
    
    // Neon text
    async neon(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .neon GLOW"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💡 *Neon Text*\n\n🔴 ${text} 🔵\n\nNeon glow effect!`
        });
    },
    
    // Devil text
    async devil(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .devil EVIL"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `😈 *Devil Text*\n\n👿 ${text} 👿\n\nFrom the dark side!`
        });
    },
    
    // Purple text
    async purple(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .purple ROYAL"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🟣 *Purple Text*\n\n👑 ${text} 👑\n\nRoyal purple!`
        });
    },
    
    // Thunder text
    async thunder(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .thunder POWER"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚡ *Thunder Text*\n\n🌩️ ${text} 🌩️\n\nPowerful like thunder!`
        });
    },
    
    // Hacker text
    async hacker(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .hacker HACK"
            });
            return;
        }
        
        const text = args.join(' ');
        const hackerText = text.split('').map(char => {
            return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
        }).join('');
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `💻 *Hacker Text*\n\n${hackerText}\n\nAccess granted! 🔓`
        });
    },
    
    // Sand text
    async sand(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .sand BEACH"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🏖️ *Sand Text*\n\n🏜️ ${text} 🏜️\n\nSandy texture!`
        });
    },
    
    // Leaves text
    async leaves(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .leaves NATURE"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🍃 *Leaves Text*\n\n🍂 ${text} 🍂\n\nNatural style!`
        });
    },
    
    // 1917 text (vintage)
    async 1917(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .1917 VINTAGE"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎞️ *1917 Vintage Text*\n\n🎩 ${text} 🎩\n\nOld school style!`
        });
    },
    
    // Arena text
    async arena(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .arena BATTLE"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚔️ *Arena Text*\n\n🛡️ ${text} 🛡️\n\nBattle ready!`
        });
    },
    
    // Blackpink text
    async blackpink(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .blackpink BLINK"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🖤💖 *BLACKPINK Text*\n\n💗 ${text} 🖤\n\nIn your area! 💥`
        });
    },
    
    // Glitch text
    async glitch(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .glitch ERROR"
            });
            return;
        }
        
        const text = args.join(' ');
        const glitchText = text.split('').map(char => {
            return Math.random() > 0.8 ? '�' : char;
        }).join('');
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `📺 *Glitch Text*\n\n${glitchText}\n\nSystem error! ⚠️`
        });
    },
    
    // Fire text
    async fire(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide text\nExample: .fire HOT"
            });
            return;
        }
        
        const text = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🔥 *Fire Text*\n\n🧯 ${text} 🧯\n\nHot like fire!`
        });
    }
};
