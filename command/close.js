module.exports = {
    name: "close",
    cmd: ['close'],
    run: async (sock, msg) => {
        try {
            const jid = msg.key.remoteJid;
            await sock.groupSettingUpdate(jid, 'announcement');
        } catch (e) { console.log(e) }
    }
};