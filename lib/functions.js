const fs = require('fs');
const path = require('path');
const config = require('../config');
const { data, save } = require('./database');
const { getGroupAnti, setAntiMode, warnUser, clearWarns } = require('./antilink');

/**
 * Returns the menu string with dynamic placeholders
 */
function buildMenu(name) {
  const ownerName = config.ownerName;
  const ownerNumber = config.ownerNumber;
  const ch = config.channelLink;
  const gp = config.groupLink;

  return `Wassup ${name} 👋

♣ PUBLIC COMMANDS
.menu
.repo
.ping
.play <song>
.hd
.vv
.vv2
.hd2
.owner
.tiktok <link>
.save

♣ GROUP COMMANDS
.tag
.hidetag
.tagall
.kick (admin)  -> reply or mention user
.add +234******** (admin only)
.open (admin)
.close (admin)
.antilink (admin) -> .antilink set delete|kick|warn|off|set warn 3
.accept all (admin)
.promote (admin)
.demote (admin)
.del (admin)
.list online
.list admin

♣ OWNER COMMANDS
.restart (owner)
.save
.mode (.public | .private)

Owner: ${ownerName} (${ownerNumber})
Channel: ${ch}
Group: ${gp}
`;
}

/**
 * sendMenu: send botpic + menu caption
 * - sock: baileys socket
 * - to: jid
 * - name: visitor name
 */
async function sendMenu(sock, to, name) {
  const mediaPath = path.join(config.mediaFolder, 'botpic.jpeg');
  const caption = buildMenu(name);
  if (fs.existsSync(mediaPath)) {
    const img = fs.readFileSync(mediaPath);
    await sock.sendMessage(to, { image: img, caption });
  } else {
    await sock.sendMessage(to, { text: caption });
  }
}

/**
 * Helper: simple mention resolver
 */
function mentionFromText(text) {
  const ms = text.match(/\+?\d{6,15}/g);
  if (!ms) return [];
  return ms.map(n => {
    n = n.replace(/\D/g, '');
    return n + '@s.whatsapp.net';
  });
}

module.exports = {
  buildMenu,
  sendMenu,
  mentionFromText,
  // antilink helpers re-exported if needed:
  getGroupAnti, setAntiMode, warnUser, clearWarns,
  data, save
};