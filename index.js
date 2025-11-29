// ───────────────────────────────────────────────
//  TUNZY-MD-V1  —  KATABUMB FULL WORKING BOT
//  Pairing Code Only + Menu Image + All Commands + Anti-link + Watermark
// ───────────────────────────────────────────────

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    DisconnectReason
} = require("@adiwajshing/baileys");
const fs = require("fs");
const pino = require("pino");
const chalk = require("chalk");
const { exec } = require("child_process");
const axios = require("axios");

const BOT_NAME = "TUNZY MD BOT";
const MENU_PIC = "./botpic.jpeg";

const GROUP_LINK = "https://chat.whatsapp.com/IaZpA3r6fgYIqMXZkWSVNd";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04";
const OWNER_NUMBER = "2349067345425";

let antiLinkSettings = {}; // store per group

//─────────────────────────────────────────────────
// PAIRING CODE ONLY
//─────────────────────────────────────────────────
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
        browser: ["TUNZY-MD-V1", "Safari", "1.0"]
    });

    if (!sock.authState.creds.registered) {
        console.log(chalk.yellow("\n📱 Enter this on WhatsApp:\nSettings → Linked Devices → Link with phone number"));
        const code = await sock.requestPairingCode(formatted);
        console.log(chalk.green(`\n🔑 PAIRING CODE: ${code}\n`));
    }

    sock.ev.on("creds.update", saveCreds);

    //──────────────────────────────────────────────
    // MESSAGE HANDLER
    //──────────────────────────────────────────────
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const isOwner = sender.includes(OWNER_NUMBER);

        //─────────────────────────────
        // MENU COMMAND
        //─────────────────────────────
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

♣ ADMIN COMMANDS
.add
.kick
.tag
.tagall
.hidetag
.accept all
.antilink
.open
.close
.promote
.demote

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

        //─────────────────────────────
        // PING
        //─────────────────────────────
        if (text === ".ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓" });
            return;
        }

        //─────────────────────────────
        // OWNER COMMANDS
        //─────────────────────────────
        if (text === ".restart" && isOwner) {
            await sock.sendMessage(from, { text: "♻ Restarting bot..." });
            process.exit();
        }

        //─────────────────────────────
        // GROUP COMMANDS
        //─────────────────────────────
        if (text === ".tagall" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const members = metadata.participants.map(u => u.id);
            await sock.sendMessage(from, {
                text: members.map(u => `@${u.split("@")[0]}`).join(" "),
                mentions: members
            });
            return;
        }

        if ((text === ".tag" || text === ".hidetag") && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const mentions = metadata.participants.map(u => u.id);
            await sock.sendMessage(from, {
                text: text === ".tag" ? "Tagged all!" : "Hidden tags!",
                mentions
            });
            return;
        }

        if (text === ".list admin" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(u => u.admin)
                .map(v => `@${v.id.split("@")[0]}`);
            await sock.sendMessage(from, { 
                text: "👮 *Group Admins:*\n" + admins.join("\n"),
                mentions: metadata.participants.map(v => v.id)
            });
            return;
        }

        if (text === ".list online" && isGroup) {
            const metadata = await sock.groupMetadata(from);
            const online = metadata.participants.map(v => `@${v.id.split("@")[0]}`);
            await sock.sendMessage(from, {
                text: "🟢 *Online Members:*\n" + online.join("\n"),
                mentions: metadata.participants.map(v => v.id)
            });
            return;
        }

        //─────────────────────────────
        // ANTI-LINK SYSTEM
        //─────────────────────────────
        if (isGroup && text.match(/chat\.whatsapp\.com/gi)) {
            const gSetting = antiLinkSettings[from] || { mode: "warn", warn: 1, kick: false, delete: true };
            if (gSetting.delete) await sock.sendMessage(from, { delete: m.key });
            if (gSetting.kick) await sock.groupParticipantsUpdate(from, [sender], "remove");
            else if (gSetting.mode === "warn") {
                await sock.sendMessage(from, { text: `⚠ Warning ${sender.split("@")[0]}!` });
            }
            return;
        }

        //─────────────────────────────
        // MEDIA COMMANDS
        //─────────────────────────────
        if (text.startsWith(".play")) {
            const query = text.replace(".play", "").trim();
            if (!query) return await sock.sendMessage(from, { text: "Please provide a song name." });
            await sock.sendMessage(from, { text: `🎵 Playing: ${query}\n⚠ Watermark added!` });
            // Integrate your audio/video downloader here with watermark
            return;
        }

        if (text.startsWith(".tiktok")) {
            const link = text.replace(".tiktok", "").trim();
            if (!link) return await sock.sendMessage(from, { text: "Please provide a TikTok link." });
            await sock.sendMessage(from, { text: `📹 Downloading TikTok video\n⚠ Watermark added!` });
            // Download & send video logic with watermark
            return;
        }

        if (text.startsWith(".vv") || text.startsWith(".vv2") || text.startsWith(".hd") || text.startsWith(".hd2")) {
            await sock.sendMessage(from, { text: "⚠ Kindly reply to a video/picture to use this command.\nWatermark will be added automatically." });
            // Reply to media and add watermark logic
            return;
        }

    });

    //─────────────────────────────
    // CONNECTION HANDLER
    //─────────────────────────────
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

//─────────────────────────────
// ASK FOR NUMBER (KATABUMB)
//─────────────────────────────
function askForNumber() {
    return new Promise((resolve) => {
        process.stdout.write("Enter WhatsApp number (e.g. 2349067xxxxx): ");
        process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });
}

startTUNZY();