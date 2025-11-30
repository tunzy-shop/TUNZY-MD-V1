module.exports = {
  name: "vv2",
  run: async (sock, msg) => {
    if (!msg.quoted) return sock.sendMessage(msg.chat, { text: "Reply to a video with .vv2 to send back as video (watermark applied server-side)." });
    try {
      const media = await msg.quoted.download();
      await sock.sendMessage(msg.chat, { video: media, caption: "© TUNZY MD BOT" });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.chat, { text: "Failed to process video." });
    }
  }
};