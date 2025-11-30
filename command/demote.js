module.exports = {
    name: "demote",
    cmd: ['demote'],
    run: async (sock, msg) => {
        const jid = msg.key.remoteJid;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned) return sock.sendMessage(jid, { text: "Mention someone to demote." });
        await sock.groupParticipantsUpdate(jid, mentioned, 'demote');
    }
};