const fs = require('fs');
const path = require('path');

module.exports = {
    name: "menu",
    cmd: ['menu'],
    alias: [],
    run: async (sock, msg, args) => {
        const { remoteJid } = msg.key;

        const menuText = `
╭───❍「 *TUNZY MD BOT* 」❍
│ Wassup 👋
│
│ 🔥 *PUBLIC COMMANDS*
│ .menu
│ .repo
│ .ping
│ .play <song>
│ .tiktok <link>
│ .save
│ .hd
│ .vv
│ .owner
│
│ 👥 *GROUP COMMANDS*
│ .tag
│ .hidetag
│ .tagall
│ .kick
│ .add
│ .open
│ .close
│ .antilink (on/off, kick, warn, delete)
│ .accept all
│ .promote
│ .demote
│ .del
│ .list admin
│ .list online
│
│ 👑 *OWNER COMMANDS*
│ .restart
│ .mode (public/private)
╰─────────────────❍

📢 *Join Channel*  
👉 https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04
        `;

        const imagePath = path.join(__dirname, '../media/botpic.jpeg');

        await sock.sendMessage(remoteJid, {
            image: fs.readFileSync(imagePath),
            caption: menuText
        });
    }
};