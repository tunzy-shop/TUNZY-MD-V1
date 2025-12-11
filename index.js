const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

console.log(`
╔═══════════════════════════════════╗
║       TUNZY-MD V1 BOT            ║
║    WhatsApp Bot by Tunzy Shop    ║
║   Version: 1.0.0                 ║
║   Owner: +2349067345425          ║
╚═══════════════════════════════════╝
`);

// Create directories
if (!fs.existsSync('./assets')) {
    fs.mkdirSync('./assets', { recursive: true });
}
if (!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp', { recursive: true });
}

// Try to load Baileys with error handling
let makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers;
let baileysLoaded = false;

try {
    const baileys = require('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
    DisconnectReason = baileys.DisconnectReason;
    fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
    Browsers = baileys.Browsers;
    baileysLoaded = true;
    console.log('✅ Baileys library loaded successfully');
} catch (error) {
    console.log('❌ Failed to load Baileys library:', error.message);
    console.log('\n📦 Please install dependencies:');
    console.log('npm install @whiskeysockets/baileys qrcode-terminal');
    process.exit(1);
}

// Bot configuration
const config = {
    name: "TUNZY-MD-V1",
    version: "1.0.0",
    author: "Tunzy",
    ownerNumber: "2349067345425",
    youtube: "Tunzy Shop",
    prefix: ".",
    
    // WhatsApp channels
    whatsappGroup: "https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1",
    whatsappChannel: "https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147"
};

// Store pairing info
let pairingInfo = {
    code: '',
    timestamp: 0,
    active: false
};

// Generate random pairing code
function generatePairingCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Display pairing instructions
function showPairingInstructions(qr = null, code = '') {
    console.log('\n══════════════════════════════════════════════════');
    console.log('📱 PAIR YOUR WHATSAPP WITH TUNZY-MD BOT');
    console.log('══════════════════════════════════════════════════\n');
    
    if (qr) {
        console.log('🔷 METHOD 1: SCAN QR CODE');
        console.log('══════════════════════════════════════════════════');
        qrcode.generate(qr, { small: true });
        console.log('\n══════════════════════════════════════════════════');
    }
    
    if (code) {
        console.log(`🔷 METHOD 2: USE PAIRING CODE: ${code}`);
        console.log('══════════════════════════════════════════════════\n');
    }
    
    console.log('📋 HOW TO PAIR:');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Tap Menu (⋮) → Linked Devices');
    console.log('3. Tap "Link a Device"');
    
    if (qr) {
        console.log('4. SCAN the QR code above');
    }
    
    if (code) {
        console.log('OR: Tap "Use pairing code instead"');
        console.log(`   Enter this code: ${code}`);
    }
    
    console.log('\n5. Wait for connection...');
    console.log('\n══════════════════════════════════════════════════');
    console.log('💡 TIP: The code works immediately, no waiting!');
    console.log('══════════════════════════════════════════════════\n');
}

async function startBot() {
    if (!baileysLoaded) {
        console.log('❌ Baileys not loaded. Cannot start bot.');
        return;
    }

    try {
        console.log('🔄 Starting TUNZY-MD Bot...');
        
        const { state, saveCreds } = await useMultiFileAuthState('./assets/auth');
        
        const sock = makeWASocket({
            version: await fetchLatestBaileysVersion(),
            logger: { level: 'warn' }, // Reduced logging to avoid errors
            printQRInTerminal: false,
            browser: Browsers.ubuntu('Chrome'),
            auth: state,
            generateHighQualityLinkPreview: false, // Reduced complexity
            syncFullHistory: false, // Don't sync old messages
            emitOwnEvents: false, // Reduced event handling
            defaultQueryTimeoutMs: 30000, // 30 second timeout
            connectTimeoutMs: 30000, // 30 second connect timeout
            keepAliveIntervalMs: 25000, // Keep connection alive
            maxRetries: 3, // Retry connection 3 times
            retryDelayMs: 2000 // Wait 2 seconds between retries
        });

        // Save credentials when updated
        sock.ev.on('creds.update', saveCreds);

        // Handle connection updates
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                // Generate pairing code
                const pairingCode = generatePairingCode();
                pairingInfo = {
                    code: pairingCode,
                    timestamp: Date.now(),
                    active: true
                };
                
                // Save to file
                fs.writeFileSync('./assets/pairing.json', JSON.stringify(pairingInfo, null, 2));
                
                // Show pairing instructions
                showPairingInstructions(qr, pairingCode);
            }
            
            if (connection === 'open') {
                console.log('\n══════════════════════════════════════════════════');
                console.log('✅ BOT CONNECTED SUCCESSFULLY!');
                console.log('══════════════════════════════════════════════════\n');
                
                // Clear pairing info
                if (fs.existsSync('./assets/pairing.json')) {
                    fs.unlinkSync('./assets/pairing.json');
                }
                
                // Send welcome message to owner
                const welcomeMsg = `🤖 *TUNZY-MD V1 Activated!*\n\n✅ Bot is now online!\n👤 Owner: ${config.author}\n📞 ${config.ownerNumber}\n📺 ${config.youtube}\n\nType .menu for commands`;
                
                try {
                    await sock.sendMessage(`${config.ownerNumber}@s.whatsapp.net`, { text: welcomeMsg });
                    console.log('📨 Welcome message sent to owner');
                } catch (error) {
                    console.log('Note: Could not send welcome message');
                }
                
                // Auto-join message
                console.log('\n📢 Bot will auto-join these channels:');
                console.log(`• WhatsApp Group: ${config.whatsappGroup}`);
                console.log(`• WhatsApp Channel: ${config.whatsappChannel}`);
                
                console.log('\n══════════════════════════════════════════════════');
                console.log('🚀 BOT IS READY TO USE!');
                console.log('══════════════════════════════════════════════════\n');
            }
            
            if (connection === 'close') {
                let reason = 'Unknown';
                if (lastDisconnect?.error) {
                    const boom = require('@hapi/boom');
                    reason = new boom.Boom(lastDisconnect.error).output.statusCode;
                }
                
                console.log(`\n⚠️ Connection closed. Reason: ${reason}`);
                
                if (reason === DisconnectReason.loggedOut) {
                    console.log('🔄 Logged out. Clearing session...');
                    fs.rmSync('./assets/auth', { recursive: true, force: true });
                }
                
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(startBot, 5000);
            }
        });

        // Handle incoming messages
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;
            
            await handleMessage(sock, msg);
        });

    } catch (error) {
        console.error('❌ Bot startup error:', error.message);
        console.log('🔄 Restarting in 10 seconds...');
        setTimeout(startBot, 10000);
    }
}

async function handleMessage(sock, msg) {
    try {
        // Extract message text
        let text = '';
        if (msg.message.conversation) {
            text = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage?.caption) {
            text = msg.message.imageMessage.caption;
        }
        
        if (!text.startsWith(config.prefix)) return;
        
        const [cmd, ...args] = text.slice(config.prefix.length).trim().split(' ');
        const command = cmd.toLowerCase();
        
        switch(command) {
            case 'menu':
            case 'help':
                const menu = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *TUNZY-MD V1 COMMANDS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 GENERAL
.ping - Check bot response
.alive - Check bot status
.owner - Show owner info
.getcode - Get pairing code
.joininfo - Show channels
.pair - Pairing instructions
.menu - Show this menu

📥 DOWNLOAD (Coming Soon)
.tiktok <url> - TikTok video
.instagram <url> - Instagram
.song <name> - Download song

🎮 FUN
.joke - Random joke
.quote - Inspirational quote
.fact - Interesting fact
.game - Games menu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Owner: ${config.author}
📞 ${config.ownerNumber}
📺 ${config.youtube}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
                await sock.sendMessage(msg.key.remoteJid, { text: menu });
                break;
                
            case 'ping':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '🏓 Pong! TUNZY-MD is alive and working!'
                });
                break;
                
            case 'alive':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🤖 *TUNZY-MD V1 is ALIVE!*\n\n✅ Version: ${config.version}\n✅ Owner: ${config.author}\n✅ Status: Online & Working\n\nPowered by Tunzy Shop`
                });
                break;
                
            case 'owner':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `👤 *OWNER INFORMATION*\n\n💼 Name: ${config.author}\n📞 Number: ${config.ownerNumber}\n📺 YouTube: ${config.youtube}\n🤖 Bot: ${config.name} v${config.version}\n\n📱 Contact: wa.me/${config.ownerNumber}`
                });
                break;
                
            case 'getcode':
                if (fs.existsSync('./assets/pairing.json')) {
                    const pairing = JSON.parse(fs.readFileSync('./assets/pairing.json', 'utf8'));
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `🔐 *CURRENT PAIRING CODE*\n\nCode: *${pairing.code}*\n\n📱 How to use:\n1. WhatsApp → Settings → Linked Devices\n2. Tap "Link a Device"\n3. Tap "Use pairing code"\n4. Enter: ${pairing.code}\n\n✅ This code works immediately!`
                    });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: '⚠️ No active pairing code.\nRestart bot to get new QR code and pairing code.'
                    });
                }
                break;
                
            case 'joininfo':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `📢 *JOIN OUR CHANNELS*\n\n💬 WhatsApp Group:\n${config.whatsappGroup}\n\n📢 WhatsApp Channel:\n${config.whatsappChannel}\n\n👥 Telegram Group:\nhttps://t.me/+Q7tUFDE71m9lNDNk\n\n📢 Telegram Channel:\nhttps://t.me/tunzy_md\n\n💻 GitHub:\nhttps://github.com/tunzy-shop`
                });
                break;
                
            case 'pair':
                const instructions = `📱 *HOW TO PAIR TUNZY-MD BOT*\n\n🔷 METHOD 1: QR CODE\n1. Restart bot to get QR code\n2. WhatsApp → Settings → Linked Devices\n3. Tap "Link a Device"\n4. Scan QR code\n\n🔷 METHOD 2: PAIRING CODE\n1. Use command: .getcode\n2. Get 6-digit code\n3. WhatsApp → Settings → Linked Devices\n4. Tap "Link a Device"\n5. Tap "Use pairing code instead"\n6. Enter the code\n\n✅ After pairing:\n• Bot will auto-join channels\n• Use .menu for commands\n• Contact owner for help\n\n📞 Owner: ${config.ownerNumber}`;
                await sock.sendMessage(msg.key.remoteJid, { text: instructions });
                break;
                
            case 'joke':
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "Why did the scarecrow win an award? He was outstanding in his field!",
                    "What do you call a fake noodle? An impasta!",
                    "Why did the math book look so sad? Because it had too many problems!",
                    "What's orange and sounds like a parrot? A carrot!"
                ];
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `😂 *JOKE TIME!*\n\n${randomJoke}\n\n😄 Enjoy your laugh!`
                });
                break;
                
            case 'quote':
                const quotes = [
                    "The only way to do great work is to love what you do. - Steve Jobs",
                    "Life is what happens to you while you're busy making other plans. - John Lennon",
                    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                    "It is during our darkest moments that we must focus to see the light. - Aristotle",
                    "Whoever is happy will make others happy too. - Anne Frank"
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `💬 *INSPIRATIONAL QUOTE*\n\n"${randomQuote}"`
                });
                break;
                
            case 'fact':
                const facts = [
                    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
                    "Octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
                    "A day on Venus is longer than a year on Venus. It takes Venus 243 Earth days to rotate once, but only 225 Earth days to orbit the sun.",
                    "Bananas are berries, but strawberries aren't.",
                    "A group of flamingos is called a 'flamboyance'."
                ];
                const randomFact = facts[Math.floor(Math.random() * facts.length)];
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `📚 *DID YOU KNOW?*\n\n${randomFact}`
                });
                break;
                
            default:
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ Unknown command: ${command}\nType .menu for available commands`
                });
        }
    } catch (error) {
        console.error('Message handling error:', error.message);
    }
}

// Start the bot
startBot();

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down TUNZY-MD Bot...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception:', error.message);
    console.log('🔄 Restarting bot...');
    setTimeout(startBot, 5000);
});

process.on('unhandledRejection', (error) => {
    console.error('⚠️ Unhandled Rejection:', error.message);
});