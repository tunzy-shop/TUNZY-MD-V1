require('dotenv').config();

// ───────────── API ENDPOINTS ─────────────
global.APIs = {
    xteam: 'https://api.xteam.xyz',
    dzx: 'https://api.dhamzxploit.my.id',
    lol: 'https://api.lolhuman.xyz',
    violetics: 'https://violetics.pw',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari: 'https://api.akuari.my.id',
    akuari2: 'https://apimu.my.id',
    nrtm: 'https://fg-nrtm.ddns.net',
    bg: 'http://bochil.ddns.net',
    fgmods: 'https://api-fgmods.ddns.net'
};

// ───────────── API KEYS ─────────────
global.APIKeys = {
    'https://api.xteam.xyz': 'd90a9e986e18778b',
    'https://api.lolhuman.xyz': '85faf717d0545d14074659ad',
    'https://api.neoxr.my.id': 'yourkey', // replace with your actual key if you have
    'https://violetics.pw': 'beta',
    'https://zenzapis.xyz': 'yourkey', // replace with your actual key if you have
    'https://api-fgmods.ddns.net': 'fg-dylux'
};

// ───────────── BOT SETTINGS ─────────────
module.exports = {
    WARN_COUNT: 3,       // Number of warns before action (kick/block)
    APIs: global.APIs,
    APIKeys: global.APIKeys
};