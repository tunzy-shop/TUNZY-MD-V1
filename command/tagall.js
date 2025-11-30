module.exports = {
    name: "tagall",
    cmd: ['tagall'],
    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;
            const metadata = await sock.groupMetadata(jid);
            const participants = metadata.participants.map(p => p.id);

            await sock.sendMessage(jid, {
                text: participants.map(u => `@${u.split("@")[0]}`).join(" "),
                mentions: participants
            });
        } catch (e) {
            console.log(e);
        }
    }
};