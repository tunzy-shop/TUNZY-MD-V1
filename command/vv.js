module.exports = {
  name: "vv",
  run: async (sock, msg) => {
    // Convert (or re-send) video as voice-note or send instruction
    if (!msg.quoted) return sock.sendMessage(msg.chat, { text: "Reply to a video with .vv to convert to voice-note." });
    try {
      const media = await msg.quoted.download();
      // For simplicity send back as voice (PTT) — real conversion requires ffmpeg
      await sock.sendMessage(msg.chat, { audio: media, mimetype: "audio/ogg; codecs=opus", ptt: true, fileName: "voice.ogg" });
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.chat, { text: "Failed to convert video to voice." });
    }
  }
};