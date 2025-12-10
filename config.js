const config = {
    name: "TUNZY-MD-V1",
    version: "1.0.0",
    author: "Tunzy",
    owner: "2349067345425@s.whatsapp.net",
    ownerNumber: "2349067345425",
    youtube: "Tunzy Shop",
    
    // Auto-join ONLY WhatsApp channels/groups
    autoJoin: {
        whatsappGroup: "https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1",
        whatsappChannel: "https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147"
    },
    
    // Bot settings
    prefix: ".",
    mode: "public",
    botpic: "./assets/botpic.jpeg",
    
    // Session configuration
    session: {
        saveInterval: 60000,
        clearOnStart: false
    },
    
    // Feature toggles
    features: {
        autoJoin: true,
        autoRead: false,
        autoTyping: false,
        antiDelete: false,
        antiCall: false,
        pmBlocker: false
    }
};

module.exports = config;