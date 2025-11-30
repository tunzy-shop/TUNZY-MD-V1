const axios = require("axios");

module.exports = {
  name: "tiktok",
  run: async (sock, msg, args) => {
    try {
      if (!args || !args[0]) return sock.sendMessage(msg.chat, { text: "Send a TikTok link" });
      const link = args[0];

      // Using a public tiktok download API (may change over time)
      const api = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(link)}`;
      const r = await axios.get(api);
      const videoUrl = r.data?.download?.no_watermark || r.data?.download?.hd || r.data?.video;

      if (!videoUrl) return sock.sendMessage(msg.chat, { text: "Can't fetch video from that link" });

      await sock.sendMessage(msg.chat, { video: { url: videoUrl }, caption: "© TUNZY MD BOT" });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.chat, { text: "Failed to download TikTok." });
    }
  }
};