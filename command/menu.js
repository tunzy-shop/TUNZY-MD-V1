const fs = require("fs");

module.exports = {
  name: "menu",
  alias: ["help"],
  run: async (sock, msg) => {

    const menutext = `Wassup ${msg.pushName} 👋

♠ PUBLIC COMMANDS / MEDIA
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

♠ OWNER COMMANDS
.restart
.save
.mode (public/private)

© TUNZY MD BOT`;

    const botPicPath = "./media/botpic.jpg"; // << YOUR IMAGE

    await sock.sendMessage(msg.chat, {
      image: fs.readFileSync(botPicPath),
      caption: menutext
    });
  }
};