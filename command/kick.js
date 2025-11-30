module.exports = {
    name: "kick",
    cmd: ['kick'],
    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;
            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned || mentioned.length === 0) 
                return await sock.sendMessage(jid, { text: "Mention the user to kick." });

            for (let user of mentioned) {
                await sock.groupParticipantsUpdate(jid, [user], 'remove');
            }
        } catch (e) {
            console.log(e);
        }
    }
};