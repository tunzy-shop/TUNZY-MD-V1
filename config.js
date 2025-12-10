const config = {
    // Bot Information
    name: "TUNZY-MD-V1",
    version: "1.0.0",
    author: "Tunzy",
    owner: "2349067345425@s.whatsapp.net",
    ownerNumber: "2349067345425",
    youtube: "Tunzy Shop",
    
    // Watermark Configuration
    watermark: {
        enabled: true,
        text: "🌹 TUNZY-MD-V1 | Tunzy Shop",
        position: "bottom-right",
        opacity: 0.7,
        color: "#FF0000",
        fontSize: 20
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
    watermarkImage: "./assets/watermark.png",
    
    // Session Configuration
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
    },
    
    // API Keys (Add your own)
    apis: {
        weather: "",
        news: "",
        openai: "",
        gemini: ""
    }
};

module.exports = config;