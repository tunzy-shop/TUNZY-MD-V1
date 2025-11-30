const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: "hd",
    cmd: ['hd'],
    run: async (sock, msg) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const jid = msg.key.remoteJid;

            if (!quoted?.imageMessage) 
                return await sock.sendMessage(jid, { text: "Reply to an image." });

            await sock.sendMessage(jid, { text: "Enhancing image... 🔄" });

            const buffer = await sock.downloadMediaMessage({
                message: quoted
            });

            const up = await axios.post('https://vihangayt.me/tools/upscale', {
                image: buffer.toString("base64")
            });

            const img = Buffer.from(up.data.result, "base64");

            await sock.sendMessage(jid, { image: img, caption: "Image enhanced 🔥" });
        } catch (e) {
            console.log(e);
        }
    }
};