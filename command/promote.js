module.exports = {
    name: "promote",
    cmd: ['promote'],
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned) return sock.sendMessage(jid, { text: "Mention someone to promote." });
        await sock.groupParticipantsUpdate(jid, mentioned, 'promote');
    }
};