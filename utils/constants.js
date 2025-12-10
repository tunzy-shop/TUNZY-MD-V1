module.exports = {
    // Bot Constants
    BOT_NAME: "TUNZY-MD-V1",
    BOT_VERSION: "1.0.0",
    BOT_AUTHOR: "Tunzy",
    
    // Commands Categories
    CATEGORIES: {
        GENERAL: 'general',
        ADMIN: 'admin',
        OWNER: 'owner',
        IMAGE: 'image',
        FUN: 'fun',
        GAME: 'game',
        AI: 'ai',
        DOWNLOAD: 'download',
        TOOLS: 'tools'
    },
    
    // Messages
    MESSAGES: {
        WELCOME: `🤖 Welcome to *TUNZY-MD-V1*\nVersion: 1.0.0\nBy: Tunzy Shop`,
        MENU: `📱 *TUNZY-MD Commands*\nType .menu to see all commands`,
        OWNER_INFO: `👤 *Owner:* Tunzy\n📞 *Contact:* +2349067345425\n📺 *YouTube:* Tunzy Shop`,
        AUTO_JOIN_SUCCESS: `✅ Successfully joined required channels!`,
        FILL_CODE: `🔐 Fill Code: TUNZY-${Date.now().toString().slice(-6)}`,
        ERROR: `❌ An error occurred. Please try again.`
    },
    
    // Auto-join Messages
    JOIN_MESSAGES: {
        WHATSAPP_GROUP: `📱 *WhatsApp Group Joined*\nLink: https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1`,
        WHATSAPP_CHANNEL: `📢 *WhatsApp Channel Joined*\nLink: https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147`,
        VIEW_CHANNELS: `👇 *View Channels:*\n• WhatsApp Group: https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1\n• WhatsApp Channel: https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147`
    },
    
    // Error Codes
    ERRORS: {
        NOT_OWNER: '❌ This command can only be used by the bot owner!',
        NOT_ADMIN: '❌ This command requires admin privileges!',
        INVALID_COMMAND: '❌ Invalid command! Type .menu for available commands.',
        GROUP_ONLY: '❌ This command can only be used in groups!',
        PM_ONLY: '❌ This command can only be used in private messages!'
    },
    
    // Watermark Text
    WATERMARK: "🌹 TUNZY-MD-V1 | By Tunzy Shop | YT: Tunzy Shop"
};