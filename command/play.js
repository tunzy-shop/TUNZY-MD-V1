const ytdl = require("ytdl-core");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "play",
  run: async (sock, msg, args) => {
    try {
      if (!args || !args.length) return await sock.sendMessage(msg.chat, { text: "Send song name or YouTube link" });

      const query = args.join(" ");
      let url = query;

      // if not a url, search YouTube
      if (!ytdl.validateURL(query)) {
        const r = await yts(query);
        if (!r || !r.videos || !r.videos.length) return sock.sendMessage(msg.chat, { text: "No result found" });
        url = r.videos[0].url;
      }

      const tmpFile = path.join("./tmp", `song_${Date.now()}.mp3`);
      const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
      const fileStream = fs.createWriteStream(tmpFile);

      await new Promise((res, rej) => {
        stream.pipe(fileStream);
        stream.on("end", res);
        stream.on("error", rej);
      });

      const buffer = fs.readFileSync(tmpFile);
      await sock.sendMessage(msg.chat, {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `TUNZY MD BOT - ${Date.now()}.mp3`,
        ptt: false,
        contextInfo: { externalAdReply: { title: "TUNZY MD BOT", sourceUrl: url } }
      });

      fs.unlinkSync(tmpFile);
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.chat, { text: "Failed to download/play the song." });
    }
  }
};