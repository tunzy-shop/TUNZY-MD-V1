module.exports = {
    name: "acceptall",
    cmd: ['acceptall'],
    run: async (sock, msg) => {
        // placeholder: depends on your logic
        await sock.sendMessage(msg.key.remoteJid, { text: "All requests accepted." });
    }
};