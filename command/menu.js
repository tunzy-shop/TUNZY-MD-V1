const fs = require("fs");
const { CHANNEL_LINK } = require("../config") || { CHANNEL_LINK: "https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04" };

module.exports = {
  name: "menu",
  alias: ["help"],
  run: async (sock, msg) => {
    const menutext = `👋 Hello ${msg.pushName || 'there'}!

───────────────
♠ PUBLIC COMMANDS
.menu
.repo
.ping
.play <song>
.tiktok <link>
.save
.hd
.hd2
.vv
.vv2
.owner
───────────────
♠ GROUP COMMANDS
.tag
.hidetag
.tagall
.kick
.add
.open
.close
.antilink (on/off, kick, warn, delete)
.accept all
.promote
.demote
.del
.list admin
.list online
───────────────
♠ OWNER COMMANDS
.restart
.save
.mode (public/private)
───────────────

© TUNZY MD BOT`;

    const imgPath = "./media/botpic.jpeg";
    const buttons = [
      { buttonId: ".repo", buttonText: { displayText: "Repo" }, type: 1 },
      { buttonId: "view_channel", buttonText: { displayText: "View Channel" }, type: 1 }
    ];

    const header = fs.existsSync(imgPath)
      ? { image: fs.readFileSync(imgPath) }
      : { text: "TUNZY MD BOT" };

    // send with buttons
    await sock.sendMessage(msg.chat, {
      ...header,
      caption: menutext,
      footer: "Tap VIEW CHANNEL to open the channel",
      buttons,
      headerType: fs.existsSync(imgPath) ? 4 : 1,
      ...(fs.existsSync(imgPath) ? {} : {})
    });

    // special handling: if the user taps the "view_channel" button, client should handle it.
    // Your handleMessages should treat buttonId "view_channel" to reply with channel URL.
  }
};