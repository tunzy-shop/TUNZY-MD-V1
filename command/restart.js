module.exports = {
    name: "restart",
    cmd: ['restart'],
    run: async (sock, msg) => {
        await sock.sendMessage(msg.key.remoteJid, { text: "♻ Restarting bot..." });
        process.exit(1);
    }
};