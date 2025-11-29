// lib/update.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const REPO = "https://raw.githubusercontent.com/tunzy-shop/TUNZY-MD-V1/main/"; // GitHub repo raw files

async function checkUpdate(fileName) {
    try {
        const url = `${REPO}${fileName}`;
        const res = await axios.get(url);
        const localPath = path.join(__dirname, "..", fileName);
        fs.writeFileSync(localPath, res.data);
        console.log(`✅ ${fileName} updated successfully!`);
    } catch (err) {
        console.log(`⚠ Failed to update ${fileName}: ${err.message}`);
    }
}

async function updateBot() {
    console.log("🔄 Checking for updates...");
    await checkUpdate("index.js");
    await checkUpdate("lib/functions.js");
    console.log("🔄 Update check completed.");
}

module.exports = { updateBot };