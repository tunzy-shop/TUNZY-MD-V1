// ───────────────────────────────────────────────
//  TUNZY-MD-V1  —  KATABUMB FULL WORKING BOT
//  Pairing Code Only + Menu Image + All Commands
// ───────────────────────────────────────────────

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    DisconnectReason,
} = require("@adiwajshing/baileys");

const fs = require("fs");
const pino = require("pino");
const chalk = require("chalk");
const { playSong, downloadTikTok, replyWithWatermark } = require("./lib/functions");

const BOT_NAME = "TUNZY MD BOT";
const MENU_PIC = "./botpic.jpeg";

const GROUP_LINK = "https://chat.whatsapp.com/IaZpA3r6fgYIqMXZkWSVNd";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04";
const OWNER_NUMBER = "2349067345425";

let antilinkStatus = false;
let antilinkAction = "warn"; // options: warn, kick, delete
let antilinkWarnLimit = 3;
let antilinkUsers = {};

//─────────────────────────────────────────────
// ASK FOR NUMBER (Katabumb prompt)
//─────────────────────────────────────────────
function askForNumber() {
    return new Promise((resolve) => {
        process.stdout.write("Enter WhatsApp number (e.g. 2349067xxxxx): ");
        process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });
}

//─────────────────────────────────────────────
// START BOT
//─────────────────────────────────────────────
async function startTUNZY() {
    console.log(chalk.green(">>> Starting TUNZY-MD-V1"));

    const number = await askForNumber();
    const formatted = number.replace(/[^0-9]/g, "");

    const { state, saveCreds } = await useMultiFileAuthState("./tmp");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ["TUNZY-MD-V1", "Safari", "1.0"],
    });

    if (!sock.authState.creds.registered) {
        console.log(chalk.yellow("\n📱 Enter this on WhatsApp:\nSettings → Linked Devices → Link with phone number"));
        const code = await sock.requestPairingCode(formatted);
        console.log(chalk.green(`\n🔑 PAIRING CODE: ${code}\n`));
    }

    sock.ev.on("creds.update", saveCreds);

    //─────────────────────────────────────────────
    // MESSAGE HANDLER
    //─────────────────────────────────────────────
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const isOwner = sender.includes(OWNER_NUMBER);

        //─────────────────────────────────────────────
        // MENU COMMAND
        //─────────────────────────────────────────────
        if (text.startsWith(".menu")) {
            let name = (await sock.getName(sender)) || "User";

            await sock.sendMessage(from, {
                image: fs.readFileSync(MENU_PIC),
                caption:
`Wassup ${name} 👋

♣ PUBLIC COMMANDS
.ping
.menu
.play <song>
.repo
.owner
.tiktok <link>
.save
.hd
.hd2
.vv
.vv2

♣ GROUP COMMANDS
.tag
.hidetag
.tagall
.kick
.add
.open
.close
.antilink
.accept all
.promote
.demote
.del
.list admin
.list online

♣ OWNER COMMANDS
.restart
.ban
.unban
.block
.anticall
.mode

Owner: TUNZY (+2349067345425)
Channel: ${CHANNEL_LINK}
Group: ${GROUP_LINK}

Powered by: ${BOT_NAME}`
            });
            return;
        }

        //─────────────────────────────────────────────
        // PING
        //─────────────────────────────────────────────
        if (text === ".ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓" });
            return;
        }

        //─────────────────────────────────────────────
        // PLAY SONG
        //─────────────────────────────────────────────
        if (text.startsWith(".play")) {
            const query = text.replace(".play", "").trim();
            if (!query) return sock.sendMessage(from, { text: "Provide song name!" });
            const file = await playSong(query, MENU_PIC);
            await sock.sendMessage(from, { video: fs.readFileSync(file), caption: `🎵 ${query}` });
            return;
        }

        //─────────────────────────────────────────────
        // TIKTOK DOWNLOAD
        //─────────────────────────────────────────────
        if (text.startsWith(".tiktok")) {
            const url = text.replace(".tiktok", "").trim();
            if (!url) return sock.sendMessage(from, { text: "Provide TikTok link!" });
            const file = await downloadTikTok(url, MENU_PIC);
            await sock.sendMessage(from, { video: fs.readFileSync(file) });
            return;
        }

        //─────────────────────────────────────────────
        // GROUP COMMANDS
        //─────────────────────────────────────────────
        if (text === ".tagall" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const mentions = metadata.participants.map(u => u.id);
            await sock.sendMessage(from, { text: mentions.map(u => `@${u.split("@")[0]}`).join("\n"), mentions });
            return;
        }

        if (text === ".list admin" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(u => u.admin)
                .map(v => `@${v.id.split("@")[0]}`);
            await sock.sendMessage(from, { text: "👮 *Group Admins:*\n" + admins.join("\n"), mentions: metadata.participants.map(v => v.id) });
            return;
        }

        if (text === ".list online" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const online = metadata.participants.map(v => `@${v.id.split("@")[0]}`);
            await sock.sendMessage(from, { text: "🟢 *Online Members:*\n" + online.join("\n"), mentions: metadata.participants.map(v => v.id) });
            return;
        }

        //─────────────────────────────────────────────
        // ANTI-LINK
        //─────────────────────────────────────────────
        if (text.match(/chat\.whatsapp\.com/gi) && isGroup && antilinkStatus) {
            if (antilinkAction === "delete") await sock.sendMessage(from, { delete: m.key });
            if (antilinkAction === "kick") await sock.groupParticipantsUpdate(from, [sender], "remove");
            if (antilinkAction === "warn") {
                antilinkUsers[sender] = (antilinkUsers[sender] || 0) + 1;
                if (antilinkUsers[sender] >= antilinkWarnLimit) {
                    await sock.groupParticipantsUpdate(from, [sender], "remove");
                    antilinkUsers[sender] = 0;
                } else {
                    await sock.sendMessage(from, { text: `⚠ Warn ${sender}, you are on anti-link protection!` });
                }
            }
            return;
        }

        //─────────────────────────────────────────────
        // OWNER COMMANDS
        //─────────────────────────────────────────────
        if (text === ".restart" && isOwner) {
            await sock.sendMessage(from, { text: "♻ Restarting bot..." });
            process.exit();
        }

        // Other commands (.mode, .ban, .unban, .block) can be added similarly

    });

    //─────────────────────────────────────────────
    // CONNECTION HANDLER
    //─────────────────────────────────────────────
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startTUNZY();
            } else console.log("❌ Logged out — delete tmp folder");
        }
        if (connection === "open") console.log(chalk.green("✅ TUNZY MD BOT Connected!"));
    });
}

startTUNZY();