
import makeWASocket, { fetchLatestBaileysVersion, useMultiFileAuthState, proto } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import readlineSync from "readline-sync";
import config from "./config.js";

async function connectBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: ["TUNZY-MD", "Chrome", "4.0"],
        auth: state,
        version
    });

    if (!sock.authState.creds.registered) {
        const number = readlineSync.question("Enter your WhatsApp number (234905xxxxxxx): ");
        const code = await sock.requestPairingCode(number);
        console.log("Your PAIRING CODE:", code);
    }

    sock.ev.on("creds.update", saveCreds);

    // Anti-call
    sock.ev.on("call", async (node) => {
        await sock.rejectCall(node.id, node.from);
        await sock.sendMessage(node.from, { text: "*🚫 Calls are not allowed.*" });
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const isGroup = from.includes("@g.us");
        if (!text) return;

        const command = text.trim().split(/ +/).shift().toLowerCase();

        // ===========================
        //        COMMANDS
        // ===========================

        // .menu
        if (command === ".menu") {
            await sock.sendMessage(from, {
                image: fs.readFileSync(config.menuImage),
                caption: `🔥 *${config.botName} MENU*\n\n` +
                    `> .menu\n> .hd\n> .vv (images)\n> .vv2 (videos/voice)\n> .ping\n> .anticall\n> .tag\n> .tagall (admin)\n> .hidetag\n> .accept all\n> .antilink\n> .mode\n\n` +
                    `👤 Owner: ${config.ownerName}\n📞 ${config.ownerNumber}\n📢 Channel: ${config.channel}`
            });
        }

        // .ping
        if (command === ".ping") await sock.sendMessage(from, { text: "🏓 Pong!" });

        // .mode
        if (command === ".mode") {
            await sock.sendMessage(from, { text: "Mode Options:\n• .public\n• .private" });
        }
        if (command === ".public") config.mode = "public";
        if (command === ".private") config.mode = "private";

        // .antilink
        if (command === ".antilink") {
            await sock.sendMessage(from, {
                text: `Antilink Options:\n• .antilink set delete\n• .antilink set kick\n• .antilink set warn\n• .antilink off`
            });
        }
        if (text.startsWith(".antilink set ")) {
            const type = text.split(" ")[3];
            config.antilink = type;
            await sock.sendMessage(from, { text: `Antilink mode set to *${type}*.` });
        }
        if (command === ".antilink" && text === ".antilink off") config.antilink = "off";

        // Anti-link enforcement
        if (config.antilink !== "off" && isGroup && text.includes("https://")) {
            switch (config.antilink) {
                case "delete":
                    await sock.sendMessage(from, { delete: msg.key });
                    break;
                case "kick":
                    await sock.groupParticipantsUpdate(from, [msg.key.participant], "remove");
                    break;
                case "warn":
                    await sock.sendMessage(from, { text: "*Warning: 1/3 for posting link!*" });
                    break;
            }
        }

        // .vv → send image from media folder
        if (command === ".vv") {
            const files = fs.readdirSync("./media").filter(f => f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png"));
            if (files.length === 0) return await sock.sendMessage(from, { text: "No images found in /media" });
            const img = fs.readFileSync(`./media/${files[0]}`);
            await sock.sendMessage(from, { image: img, caption: "Here is an image for you!" });
        }

        // .vv2 → send video or voice (mp4 / mp3)
        if (command === ".vv2") {
            const files = fs.readdirSync("./media").filter(f => f.endsWith(".mp4") || f.endsWith(".mp3"));
            if (files.length === 0) return await sock.sendMessage(from, { text: "No videos/voice files found in /media" });
            const media = fs.readFileSync(`./media/${files[0]}`);
            if (files[0].endsWith(".mp4")) {
                await sock.sendMessage(from, { video: media, caption: "Here is a video for you!" });
            } else {
                await sock.sendMessage(from, { audio: media, mimetype: "audio/mpeg" });
            }
        }

        // .hd → send high-quality image
        if (command === ".hd") {
            const files = fs.readdirSync("./media").filter(f => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg"));
            if (files.length === 0) return await sock.sendMessage(from, { text: "No HD images found" });
            const img = fs.readFileSync(`./media/${files[0]}`);
            await sock.sendMessage(from, { image: img, caption: "High-quality image!" });
        }

        // .tag → mention a specific person by number
        if (command === ".tag") {
            if (!isGroup) return;
            const args = text.split(" ");
            if (args.length < 2) return;
            const number = args[1].replace(/\D/g, "");
            await sock.sendMessage(from, { text: `Hey @${number}`, mentions: [`${number}@s.whatsapp.net`] });
        }

        // .tagall → mention all group members (admin only)
        if (command === ".tagall") {
            if (!isGroup) return;
            const groupMetadata = await sock.groupMetadata(from);
            const mentions = groupMetadata.participants.map(p => p.id);
            await sock.sendMessage(from, { text: `Attention everyone!`, mentions });
        }

        // .hidetag → tag all without showing mentions
        if (command === ".hidetag") {
            if (!isGroup) return;
            const groupMetadata = await sock.groupMetadata(from);
            const mentions = groupMetadata.participants.map(p => p.id);
            await sock.sendMessage(from, { text: `Hidden mention for all`, mentions });
        }

        // .accept all → approve all pending group participants
        if (command === ".accept") {
            const args = text.split(" ");
            if (args[1] === "all" && isGroup) {
                const pending = (await sock.groupMetadata(from)).participants.filter(p => p.pending);
                for (const p of pending) {
                    await sock.groupParticipantsUpdate(from, [p.id], "add");
                }
                await sock.sendMessage(from, { text: "✅ All pending members accepted" });
            }
        }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") {
            console.log("Reconnecting...");
            connectBot();
        }
    });
}

connectBot();