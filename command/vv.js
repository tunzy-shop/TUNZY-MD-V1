module.exports = {
    name: "vv",
    cmd: ['vv'],
    run: async (sock, msg) => {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const jid = msg.key.remoteJid;

            if (!quoted) return await sock.sendMessage(jid, { text: "Reply to a view-once image/video." });

            if (quoted.viewOnceMessageV2) {
                const media = quoted.viewOnceMessageV2.message;
                await sock.sendMessage(jid, media, { quoted: msg });
            } else {
                await sock.sendMessage(jid, { text: "That message is not view-once." });
            }
        } catch (e) {
            console.log(e);
        }
    }
};