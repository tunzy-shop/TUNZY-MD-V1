const db = require("./database");

module.exports = {
    checkLink: async (sock, m, text, groupId) => {
        // Load group settings from db
        let groups = db.readDB();
        if (!groups[groupId]) groups[groupId] = { antilink: { status: false, action: "warn", limit: 3 } };
        let settings = groups[groupId].antilink;

        // Check if antilink is on
        if (!settings.status) return false;

        if (text.match(/chat\.whatsapp\.com/gi)) {
            const sender = m.key.participant || m.key.remoteJid;

            // Warn system
            if (settings.action === "warn") {
                const warnCount = db.addWarn(groupId, sender);
                await sock.sendMessage(groupId, { text: `⚠ You sent a link! Warning ${warnCount}/${settings.limit}` });
                if (warnCount >= settings.limit) {
                    await sock.groupParticipantsUpdate(groupId, [sender], "remove");
                    db.resetWarn(groupId, sender);
                }
            }

            // Kick system
            if (settings.action === "kick") {
                await sock.groupParticipantsUpdate(groupId, [sender], "remove");
                await sock.sendMessage(groupId, { text: `⚠ ${sender.split("@")[0]} was removed for posting a link!` });
            }

            // Delete message system
            if (settings.action === "delete") {
                await sock.sendMessage(groupId, { delete: m.key });
            }

            return true;
        }
        return false;
    },

    toggle: (groupId, status = true, action = "warn", limit = 3) => {
        let groups = db.readDB();
        if (!groups[groupId]) groups[groupId] = { antilink: {} };
        groups[groupId].antilink = { status, action, limit };
        db.writeDB(groups);
    }
};