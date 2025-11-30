const fs = require("fs");
module.exports = {
  name: "save",
  run: async (sock, msg) => {
    // This command tells user how to use save: reply to media with ".save"
    if (!msg.quoted) {
      return sock.sendMessage(msg.chat, { text: "Reply to a media (image/video/voice) with .save to save it." });
    }

    try {
      const media = await msg.quoted.download();
      const mime = msg.quoted.mimetype || "application/octet-stream";
      const ext = mime.split("/").pop().split(";")[0];
      const filePath = `./media/saved_${Date.now()}.${ext}`;
      fs.writeFileSync(filePath, media);
      await sock.sendMessage(msg.chat, { text: `Saved to ${filePath} (server-side)` });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.chat, { text: "Failed to save media." });
    }
  }
};