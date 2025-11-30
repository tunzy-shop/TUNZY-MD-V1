module.exports = {
    name: "hidetag",
    cmd: ['hidetag'],
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata.participants.map(p => p.id);

        await sock.sendMessage(jid, {
            text: "",
            mentions: participants
        });
    }
};