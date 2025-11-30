module.exports = {
    name: "mode",
    cmd: ['mode'],
    run: async (sock, msg, args) => {
        global.publicMode = args[0] === "public";
        await sock.sendMessage(msg.key.remoteJid, { text: `Bot mode set to: ${global.publicMode ? "Public" : "Private"}` });
    }
};