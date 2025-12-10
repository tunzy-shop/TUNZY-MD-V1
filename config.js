const config = {
    name: "TUNZY-MD-V1",
    version: "1.0.0",
    author: "Tunzy",
    owner: "2349067345425@s.whatsapp.net",
    ownerNumber: "2349067345425",
    youtube: "Tunzy Shop",
    
    // Media Watermark Configuration
    watermark: {
        enabled: true,
        text: "TUNZY MD V1",
        fontSize: 40,
        fontColor: "#FFFFFF",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "bottom-right",
        padding: 20,
        opacity: 0.8
    },
    
    // Auto-join Configuration
    autoJoin: {
        enabled: true,
        whatsappGroup: "https://chat.whatsapp.com/IRYmTfhi6PM60ImJJew5o1",
        whatsappChannel: "https://whatsapp.com/channel/0029Vb7EWFcIHphQPz7S4147"
    },
    
    // Bot Settings
    prefix: ".",
    mode: "public",
    botpic: "./assets/botpic.jpeg",
    
    // Download settings (NO API NEEDED)
    downloads: {
        watermarkAllMedia: true,
        maxSize: 50 // MB
    },
    
    // Session configuration
    session: {
        saveInterval: 60000,
        clearOnStart: false
    },
    
    // Features
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
