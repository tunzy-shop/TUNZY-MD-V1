// lib/functions.js
const fs = require("fs");
const axios = require("axios");
const path = require("path");

// Watermark text
const WATERMARK = "TUNZY MD BOT";

//─────────────────────────────────────────────
// Send Menu with BotPic
//─────────────────────────────────────────────
async function sendMenu(sock, from, name, menuPic, channel, group) {
    const caption = `
Wassup ${name} 👋

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

♣ GROUP COMMANDS
.gc link
.list admin
.list online

Owner: TUNZY (+2349067345425)
Channel: ${channel}
Group: ${group}

Powered by: TUNZY MD BOT`;

    await sock.sendMessage(from, {
        image: fs.readFileSync(menuPic),
        caption
    });
}

//─────────────────────────────────────────────
// Download media from URL
//─────────────────────────────────────────────
async function downloadMedia(url, dest) {
    const writer = fs.createWriteStream(dest);
    const response = await axios({ url, method: "GET", responseType: "stream" });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

//─────────────────────────────────────────────
// Add Watermark (placeholder, actual video processing can use ffmpeg)
//─────────────────────────────────────────────
async function addWatermark(inputFile, outputFile) {
    // For Katabumb, actual ffmpeg processing might be used
    // Here we just copy the file as a placeholder
    fs.copyFileSync(inputFile, outputFile);
    return outputFile;
}

//─────────────────────────────────────────────
// Play Song / Video (with watermark)
//─────────────────────────────────────────────
async function playMedia(url, dest) {
    const tempFile = path.join("./tmp", "media.mp4");
    await downloadMedia(url, tempFile);
    const finalFile = path.join(dest, "play_watermarked.mp4");
    await addWatermark(tempFile, finalFile);
    return finalFile;
}

//─────────────────────────────────────────────
// TikTok Video Downloader (with watermark)
//─────────────────────────────────────────────
async function downloadTikTok(url, dest) {
    // Placeholder: Katabumb users can replace with actual tiktok API
    const tempFile = path.join("./tmp", "tiktok.mp4");
    await downloadMedia(url, tempFile);
    const finalFile = path.join(dest, "tiktok_watermarked.mp4");
    await addWatermark(tempFile, finalFile);
    return finalFile;
}

//─────────────────────────────────────────────
// Simple JSON Database
//─────────────────────────────────────────────
const dbFile = "./lib/database.json";

function readDB() {
    if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(dbFile));
}

function writeDB(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

//─────────────────────────────────────────────
// Exports
//─────────────────────────────────────────────
module.exports = {
    sendMenu,
    downloadMedia,
    addWatermark,
    playMedia,
    downloadTikTok,
    readDB,
    writeDB,
};