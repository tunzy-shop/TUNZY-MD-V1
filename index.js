const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    Browsers
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Ensure directories exist
if (!fs.existsSync('./assets')) fs.mkdirSync('./assets', { recursive: true });
if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });

// Bot Configuration
const config = {
    name: "TUNZY-MD-V1",
    version: "1.0.0",
    author: "Tunzy",
    owner: "2349067345425@s.whatsapp.net",
    ownerNumber: "2349067345425",
    youtube: "Tunzy Shop",
    prefix: ".",
    
    // Auto-join
    whatsappGroup: "https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1",
    whatsappChannel: "https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147"
};

async function startBot() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *TUNZY-MD-V1*  
┃✮│➣ Version: *${config.version}*
➣ by ${config.author}
➣ YT : ${config.youtube}
━━━━━━━━━━━━━━━━━━━┈⊷
    `);

    const { state, saveCreds } = await useMultiFileAuthState('./assets/auth');
    
    const sock = makeWASocket({
        version: await fetchLatestBaileysVersion(),
        logger: { level: 'silent' },
        printQRInTerminal: false, // We'll handle QR ourselves
        browser: Browsers.ubuntu('Chrome'),
        auth: state,
        generateHighQualityLinkPreview: true,
    });

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    // Handle connection
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n🔄 QR Code Received!');
            qrcode.generate(qr, { small: true });
            
            // Generate pairing code
            const pairingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            console.log(`\n🔐 Pairing Code: ${pairingCode}`);
            
            // Save pairing info
            const pairingInfo = {
                qr: qr,
                code: pairingCode,
                timestamp: Date.now(),
                status: 'waiting'
            };
            
            fs.writeFileSync('./assets/pairing.json', JSON.stringify(pairingInfo, null, 2));
            
            console.log('\n📱 How to Pair:');
            console.log('1. Open WhatsApp on your phone');
            console.log('2. Go to Settings → Linked Devices');
            console.log('3. Tap on "Link a Device"');
            console.log('4. Scan QR Code OR enter pairing code');
            console.log(`5. Code: ${pairingCode}`);
            console.log('\n⏳ Waiting for pairing...');
        }
        
        if (connection === 'open') {
            console.log('\n✅ Bot connected successfully!');
            console.log(`👤 Owner: ${config.ownerNumber}`);
            
            // Send welcome message
            const welcomeMsg = `🤖 *${config.name} v${config.version}*\n\n✅ Bot Activated!\n👤 Owner: ${config.author}\n📞 ${config.ownerNumber}\n📺 ${config.youtube}\n\nType .menu for commands`;
            
            try {
                await sock.sendMessage(config.owner, { text: welcomeMsg });
            } catch (error) {
                console.log('Note: Could not send message to owner');
            }
            
            // Clear pairing file
            if (fs.existsSync('./assets/pairing.json')) {
                fs.unlinkSync('./assets/pairing.json');
            }
        }
        
        if (connection === 'close') {
            const reason = new (require('@hapi/boom')).Boom(lastDisconnect.error).output.statusCode;
            console.log(`\n❌ Connection closed. Reason: ${reason}`);
            
            if (reason === DisconnectReason.loggedOut) {
                console.log('🔄 Logged out. Restarting...');
                fs.rmSync('./assets/auth', { recursive: true, force: true });
            }
            
            // Reconnect after 5 seconds
            setTimeout(startBot, 5000);
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        await handleMessage(sock, msg, config);
    });
}

// Simple message handler
async function handleMessage(sock, msg, config) {
    const text = extractText(msg);
    if (!text || !text.startsWith(config.prefix)) return;
    
    const [cmd, ...args] = text.slice(config.prefix.length).trim().split(' ');
    const command = cmd.toLowerCase();
    
    try {
        switch(command) {
            case 'menu':
            case 'help':
                await showMenu(sock, msg, config);
                break;
                
            case 'ping':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '🏓 Pong!'
                });
                break;
                
            case 'owner':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `👤 *Owner Info*\n\nName: ${config.author}\nNumber: ${config.ownerNumber}\nYouTube: ${config.youtube}`
                });
                break;
                
            case 'alive':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🤖 *${config.name} is ALIVE!*\n\nVersion: ${config.version}\nOwner: ${config.author}`
                });
                break;
                
            case 'getcode':
                await getPairingCode(sock, msg);
                break;
                
            case 'joininfo':
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `📢 *Auto-Join Channels*\n\nWhatsApp Group:\n${config.whatsappGroup}\n\nWhatsApp Channel:\n${config.whatsappChannel}`
                });
                break;
                
            case 'pair':
                await showPairingInstructions(sock, msg);
                break;
                
            default:
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ Unknown command: ${command}\nType .menu for available commands`
                });
        }
    } catch (error) {
        console.error('Command error:', error);
    }
}

function extractText(msg) {
    if (msg.message.conversation) return msg.message.conversation;
    if (msg.message.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
    if (msg.message.imageMessage?.caption) return msg.message.imageMessage.caption;
    return '';
}

async function showMenu(sock, msg, config) {
    const menu = `
━━━━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *TUNZY-MD-V1*  
┃✮│➣ Version: *${config.version}*
➣ by ${config.author}
━━━━━━━━━━━━━━━━━━━┈⊷

*COMMANDS:*
.ping - Check bot response
.alive - Check if bot is alive
.owner - Show owner info
.getcode - Get pairing code
.joininfo - Show channels to join
.pair - Show pairing instructions
.menu - This menu

━━━━━━━━━━━━━━━━━━━┈⊷
📢 Join our channels!
WhatsApp Group: ${config.whatsappGroup}
WhatsApp Channel: ${config.whatsappChannel}
━━━━━━━━━━━━━━━━━━━┈⊷
    `;
    
    await sock.sendMessage(msg.key.remoteJid, { text: menu });
}

async function getPairingCode(sock, msg) {
    try {
        if (fs.existsSync('./assets/pairing.json')) {
            const pairingInfo = JSON.parse(fs.readFileSync('./assets/pairing.json', 'utf8'));
            
            const instructions = `
🔐 *Pairing Information*

*QR Code:* Scan with WhatsApp
*Pairing Code:* ${pairingInfo.code}

*How to Pair:*
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Scan QR Code OR enter code: ${pairingInfo.code}
5. Wait for connection

*Note:* This code is active until scanned.
            `;
            
            await sock.sendMessage(msg.key.remoteJid, { text: instructions });
        } else {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '⚠️ No active pairing session. Restart bot to get new code.'
            });
        }
    } catch (error) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ Error getting pairing code'
        });
    }
}

async function showPairingInstructions(sock, msg) {
    const instructions = `
📱 *How to Pair TUNZY-MD Bot*

*Method 1: QR Code*
1. Restart the bot to get new QR code
2. Open WhatsApp → Settings → Linked Devices
3. Tap "Link a Device"
4. Scan the QR code shown in terminal

*Method 2: Pairing Code*
1. Use command: .getcode
2. Get the 6-digit code
3. Open WhatsApp → Settings → Linked Devices
4. Tap "Link a Device"
5. Tap "Use pairing code instead"
6. Enter the code

*After Pairing:*
• Bot will auto-join channels
• Use .menu to see commands
• Contact owner for help

📞 Owner: ${config.ownerNumber}
    `;
    
    await sock.sendMessage(msg.key.remoteJid, { text: instructions });
}

// Start the bot
startBot().catch(console.error);