module.exports = {
    name: "save",
    cmd: ['save'],
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return sock.sendMessage(jid, { text: "Reply to a status to save it." });

            const media = await sock.downloadMediaMessage({ message: quoted });

            await sock.sendMessage(jid, {
                document: media,
                mimetype: "application/octet-stream",
                fileName: "status_saved"
            });

        } catch (err) {
            console.log(err);
            sock.sendMessage(jid, { text: "Failed to save." });
        }
    }
};