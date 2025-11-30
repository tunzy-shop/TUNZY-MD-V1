module.exports = {
  name: "hd2",
  run: async (sock, msg) => {
    await sock.sendMessage(msg.chat, { text: "HD2 works same as .hd. Reply to a video or provide link." });
  }
};