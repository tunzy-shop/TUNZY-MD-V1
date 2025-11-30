// Full TUNZY-MD-V1 — Katabumb Ready
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    DisconnectReason
} = require("@adiwajshing/baileys");
const fs = require("fs");
const chalk = require("chalk");
const pino = require("pino");

const { BOT_NAME, OWNER_NUMBER, GROUP_LINK, CHANNEL_LINK, MENU_PIC, ANTI_LINK } = require("./config");
const { saveJSON, loadJSON, delay } = require("./lib/functions");

const tmpFolder = "./tmp";
if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder);

async function startTUNZY() {
    console.log(chalk.green(">>> Starting TUNZY-MD-V1"));

    const number = await askForNumber();
    const formatted = number.replace(/[^0-9]/g, "");

    const { state, saveCreds } = await useMultiFileAuthState(tmpFolder);
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

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const sender = jidNormalizedUser(m.key.participant || m.key.remoteJid);
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const isOwner = sender.includes(OWNER_NUMBER);

        // ────────── MENU
        if (text.startsWith(".menu")) {
            let name = (await sock.getName(sender)) || "User";
            await sock.sendMessage(from, {
                image: fs.readFileSync(MENU_PIC),
                caption:
`Wassup ${name} 👋

♠ PUBLIC COMMANDS / MEDIA
.menu
.repo
.ping
.play <song>
.tiktok <link>
.save
.hd
.hd2
.vv
.vv2
.owner

♠ GROUP COMMANDS
.tag
.hidetag
.tagall
.kick
.add
.open
.close
.antilink (on/off, kick, warn, delete)
.accept all
.promote
.demote
.del
.list admin
.list online

♠ OWNER COMMANDS
.restart
.save
.mode (public/private)

Owner: TUNZY (+${OWNER_NUMBER})
Channel: ${CHANNEL_LINK}
Group: ${GROUP_LINK}

Powered by: ${BOT_NAME}`
            });
            return;
        }

        // ────────── PING
        if (text === ".ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓" });
            return;
        }

        // ────────── OWNER
        if (text === ".restart" && isOwner) {
            await sock.sendMessage(from, { text: "♻ Restarting bot..." });
            process.exit();
        }

        // ────────── GROUP COMMANDS
        if (isGroup) {
            const metadata = await sock.groupMetadata(from);
            const members = metadata.participants.map(u => u.id);

            // .tagall
            if (text === ".tagall") {
                await sock.sendMessage(from, {
                    text: members.map(u => `@${u.split("@")[0]}`).join(" "),
                    mentions: members
                });
                return;
            }

            // .list admin
            if (text === ".list admin") {
                const admins = metadata.participants.filter(u => u.admin)
                    .map(v => `@${v.id.split("@")[0]}`);
                await sock.sendMessage(from, {
                    text: "👮 *Group Admins:*\n" + admins.join("\n"),
                    mentions: metadata.participants.map(v => v.id)
                });
                return;
            }

            // .list online
            if (text === ".list online") {
                const online = metadata.participants.map(v => `@${v.id.split("@")[0]}`);
                await sock.sendMessage(from, {
                    text: "🟢 *Online Members:*\n" + online.join("\n"),
                    mentions: metadata.participants.map(v => v.id)
                });
                return;
            }

            // ANTI-LINK
            if (text.match(/chat\.whatsapp\.com/gi) && ANTI_LINK.ON) {
                await sock.sendMessage(from, { text: "⚠ WhatsApp link detected!" });
                if (ANTI_LINK.DELETE) await sock.sendMessage(from, { delete: m.key });
                return;
            }
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startTUNZY();
            } else {
                console.log("❌ Logged out — delete tmp folder and re-link");
            }
        }
        if (connection === "open") {
            console.log(chalk.green("✅ TUNZY MD BOT Connected!"));
        }
    });
}

function askForNumber() {
    return new Promise(resolve => {
        process.stdout.write("Enter WhatsApp number (e.g. 2349067xxxxx): ");
        process.stdin.once("data", data => resolve(data.toString().trim()));
    });
}

startTUNZY();