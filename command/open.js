module.exports = {
    name: "open",
    cmd: ['open'],
    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;
            await sock.groupSettingUpdate(jid, 'not_announcement');
        } catch (e) { console.log(e) }
    }
};