module.exports = {
  name: "repo",
  run: async (sock, msg) => {
    const text = `GitHub Repo:
https://github.com/tunzy-shop/TUNZY-MD-V1

© TUNZY MD BOT`;
    await sock.sendMessage(msg.chat, { text });
  }
};