module.exports = {
    name: "antilink",
    cmd: ['antilink'],
    run: async (sock, msg, args) => {
        try {
            const jid = msg.key.remoteJid;
            const option = args[0]?.toLowerCase();

            const state = {
                on: true,
                action: args[1] || 'warn' // kick, warn, delete
            };

            await sock.sendMessage(jid, { text: `Antilink set to: ${option}\nAction: ${state.action}` });
        } catch (e) { console.log(e) }
    }
};