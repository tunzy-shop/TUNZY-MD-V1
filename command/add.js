module.exports = {
    name: "add",
    cmd: ['add'],
    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;
            const number = msg.message?.extendedTextMessage?.text?.split(" ")[1];

            if (!number) return sock.sendMessage(jid, { text: "Send number to add (e.g. 2349012345678)" });

            await sock.groupParticipantsUpdate(jid, [`${number}@s.whatsapp.net`], 'add');
        } catch (e) {
            console.log(e);
        }
    }
};