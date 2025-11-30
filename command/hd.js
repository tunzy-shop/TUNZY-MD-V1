const axios = require("axios");
module.exports = {
  name: "hd",
  run: async (sock, msg) => {
    // Placeholder for HD download/convert — ask user to reply to video or send link
    await sock.sendMessage(msg.chat, { text: "Reply to a video or send a link. HD processing may require an external API." });
  }
};