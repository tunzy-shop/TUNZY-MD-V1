module.exports = {
    name: "tag",
    cmd: ['tag'],
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;

        try {
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants.map(p => p.id);

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let text = quoted ? "*TAG:* " : "*TAG ALL*";

            await sock.sendMessage(jid, {
                text: text,
                mentions: participants
            }, { quoted: msg });

        } catch (e) {
            console.log(e);
        }
    }
};