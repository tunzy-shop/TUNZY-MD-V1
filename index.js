/**
 * TUNZY-MD-V1 — single index.js
 * Pairing-code only, full commands, watermarks, antilink, list admin/online
 *
 * Required folders:
 *  - ./tmp/           (session storage)
 *  - ./media/botpic.jpeg
 *
 * Required packages:
 * npm i @whiskeysockets/baileys pino chalk axios ytdl-core yt-search ffmpeg-static
 *
 * Also ensure ffmpeg is available (system or ffmpeg-static)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
const axios = require('axios');
const P = require('pino');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const ffmpegStatic = require('ffmpeg-static');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
} = require('@whiskeysockets/baileys');

// ------------- CONFIG -------------
const CONFIG = {
  ownerNumber: '+2349067345425',
  ownerName: 'Tunzy Shop',
  botName: 'TUNZY MD V1',
  channelLink: 'https://whatsapp.com/channel/0029Vb65QAGGOj9nnQynhh04',
  groupLink: 'https://chat.whatsapp.com/IaZpA3r6fgYIqMXZkWSVNd',
  prefix: '.',
  tmpFolder: './tmp',
  mediaFolder: './media',
  dbFile: './data/db.json',
  watermarkText: 'TUNZY-MD-V1'
};

// ensure folders exist
if (!fs.existsSync(CONFIG.tmpFolder)) fs.mkdirSync(CONFIG.tmpFolder, { recursive: true });
if (!fs.existsSync(path.dirname(CONFIG.dbFile))) fs.mkdirSync(path.dirname(CONFIG.dbFile), { recursive: true });
if (!fs.existsSync(CONFIG.mediaFolder)) fs.mkdirSync(CONFIG.mediaFolder, { recursive: true });

// ------------- SIMPLE JSON DB -------------
let DB = { banned: [], antilink: {}, settings: { mode: 'public' } };
try {
  if (fs.existsSync(CONFIG.dbFile)) DB = JSON.parse(fs.readFileSync(CONFIG.dbFile, 'utf8'));
} catch (e) {
  console.error('DB load error', e);
}
function saveDB() { fs.writeFileSync(CONFIG.dbFile, JSON.stringify(DB, null, 2)); }

// ------------- UTIL: watermark using ffmpeg -------------
const FFMPEG_PATH = (function() {
  // prefer system ffmpeg if available, otherwise ffmpeg-static
  const which = (cmd) => {
    try { return require('child_process').execSync(`which ${cmd}`).toString().trim(); } catch { return null; }
  };
  return which('ffmpeg') || ffmpegStatic || 'ffmpeg';
})();

async function addWatermarkVideo(inputFileOrUrl, wmText = CONFIG.watermarkText) {
  // input can be a local path or an http(s) URL
  const tmpIn = path.join(CONFIG.tmpFolder, `in_${Date.now()}`);
  const tmpOut = path.join(CONFIG.tmpFolder, `wm_${Date.now()}.mp4`);

  // if input is url, download to tmpIn
  if (/^https?:\/\//i.test(inputFileOrUrl)) {
    const writer = fs.createWriteStream(tmpIn);
    const res = await axios.get(inputFileOrUrl, { responseType: 'stream' });
    await new Promise((resv, rej) => { res.data.pipe(writer); writer.on('finish', resv); writer.on('error', rej); });
  } else {
    // assume file path or buffer
    if (Buffer.isBuffer(inputFileOrUrl)) {
      fs.writeFileSync(tmpIn, inputFileOrUrl);
    } else {
      // copy to tmpIn
      fs.copyFileSync(inputFileOrUrl, tmpIn);
    }
  }

  // ffmpeg drawtext watermark bottom-right
  const cmd = `${FFMPEG_PATH} -y -i "${tmpIn}" -vf "drawtext=text='${wmText}':fontcolor=white:fontsize=24:box=1:boxcolor=0x000000@0.4:boxborderw=5:x=w-tw-10:y=h-th-10" -c:a copy "${tmpOut}"`;

  await new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // cleanup input if downloaded
  try { if (fs.existsSync(tmpIn) && tmpIn.includes('in_')) fs.unlinkSync(tmpIn); } catch(e){}

  return tmpOut;
}

// ------------- UTIL: mention helper -------------
function parseMentionsFromText(text = '') {
  const found = text.match(/\+?\d{6,15}/g);
  if (!found) return [];
  return found.map(n => `${n.replace(/\D/g,'')}@s.whatsapp.net`);
}

// ------------- MENU BUILDER -------------
function buildMenu(name) {
  return `Wassup ${name} 👋

♣ PUBLIC COMMANDS / MEDIA
.menu
.repo
.ping
.play <song>
.hd
.vv
.vv2
.hd2
.playvideo <song>
.tiktok <link>
.owner
.save

♣ GROUP COMMANDS
.tag
.hidetag
.tagall
.kick (admin)
.add +234xxxxxxxx (admin)
.open (admin)
.close (admin)
.antilink set delete | kick | warn | off
.accept all (admin)
.promote (admin)
.demote (admin)
.del
.list online
.list admin

♣ OWNER COMMANDS
.restart
.save
.mode (.public | .private)

Owner: ${CONFIG.ownerName} (${CONFIG.ownerNumber})
Channel: ${CONFIG.channelLink}
Group: ${CONFIG.groupLink}
`;
}

// ------------- PAIRING & BOT START -------------
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(CONFIG.tmpFolder, 'auth_info'));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // we do pairing code only
    auth: state,
    version
  });

  // if pairing possible via requestPairingCode, prompt phone and request
  try {
    if (!state.creds?.registered && typeof sock.requestPairingCode === 'function') {
      // ask for phone via stdin
      process.stdout.write('Enter your WhatsApp number (e.g +2349xxxxxxxxx): ');
      process.stdin.once('data', async (d) => {
        const number = d.toString().trim().replace(/\D/g, '');
        try {
          const code = await sock.requestPairingCode(number);
          console.log(chalk.green('\nPAIRING CODE (paste into WhatsApp → Linked devices → Link a device):\n'));
          console.log(chalk.yellow(code), '\n');
        } catch (e) {
          console.error('Pairing code error:', e?.message || e);
        }
      });
    }
  } catch (e) {
    // not supported by this build — ignore
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('Connection closed — reconnecting...'));
        startBot();
      } else {
        console.log(chalk.red('Logged out — remove session and re-run.'));
      }
    } else if (connection === 'open') {
      console.log(chalk.green('TUNZY-MD-V1 connected ✅'));
    }
  });

  // ---------------- MESSAGE HANDLER ----------------
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const message = m.messages[0];
      if (!message || !message.message) return;
      // ignore own messages? we use standard checks
      if (message.key && message.key.fromMe) {
        // allow owner commands from bot account if necessary
      }

      const from = message.key.remoteJid;
      const isGroup = from?.endsWith?.('@g.us');
      const sender = message.key.participant || message.key.remoteJid;
      const pushName = message.pushName || (message.key.fromMe ? CONFIG.ownerName : 'User');

      // extract text
      let text = '';
      if (message.message.conversation) text = message.message.conversation;
      else if (message.message.extendedTextMessage?.text) text = message.message.extendedTextMessage.text;
      else if (message.message.imageMessage?.caption) text = message.message.imageMessage.caption;
      text = (text || '').trim();

      // helper reply
      const reply = async (txt) => {
        try { await sock.sendMessage(from, { text: txt }, { quoted: message }); } catch {}
      };

      // check banned
      if (DB.banned && DB.banned.includes(sender)) return;

      // ANTI-LINK live check (group)
      if (isGroup && DB.antilink && DB.antilink[from] && DB.antilink[from].mode && DB.antilink[from].mode !== 'off') {
        const linkRegex = /(https?:\/\/[^\s]+)/ig;
        if (linkRegex.test(text)) {
          // check admin status
          let isSenderAdmin = false;
          try {
            const meta = await sock.groupMetadata(from);
            const part = meta.participants.find(p => p.id === sender);
            isSenderAdmin = !!(part && part.admin);
          } catch (e) {}
          if (!isSenderAdmin) {
            const mode = DB.antilink[from].mode;
            if (mode === 'delete') {
              // cannot truly delete arbitrary message easily; respond with note
              try { await sock.sendMessage(from, { text: `⚠️ Link detected — message should be deleted.` }, { quoted: message }); } catch {}
            } else if (mode === 'kick') {
              try {
                await sock.groupParticipantsUpdate(from, [sender.replace('@s.whatsapp.net','') + '@s.whatsapp.net'], 'remove');
                await sock.sendMessage(from, { text: `🚫 Removed user for posting link.` });
              } catch (e) { await reply('I need admin to kick users.'); }
            } else if (mode === 'warn') {
              DB.antilink[from].warns = DB.antilink[from].warns || {};
              DB.antilink[from].warns[sender] = (DB.antilink[from].warns[sender] || 0) + 1;
              saveDB();
              const w = DB.antilink[from].warns[sender];
              await reply(`⚠️ Warning ${w}/3 for posting a link.`);
              if (w >= 3) {
                try {
                  await sock.groupParticipantsUpdate(from, [sender], 'remove');
                  delete DB.antilink[from].warns[sender];
                  saveDB();
                  await sock.sendMessage(from, { text: `🚫 Removed ${sender.split('@')[0]} after 3 warnings.` });
                } catch (e) { await reply('I need admin to remove this member.'); }
              }
            }
          }
        }
      }

      // MODE: public/private
      if (DB.settings && DB.settings.mode === 'private') {
        // only owner allowed to use commands
        const onlyOwnerPrefixes = text.startsWith(CONFIG.prefix);
        if (onlyOwnerPrefixes) {
          if (!(sender && sender.includes(CONFIG.ownerNumber.replace(/\D/g,'')))) return;
        }
      }

      // only commands with prefix
      if (!text.startsWith(CONFIG.prefix)) return;
      const args = text.slice(CONFIG.prefix.length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();

      // fetch group metadata for admin checks
      let groupMeta = null;
      let admins = [];
      if (isGroup) {
        try { groupMeta = await sock.groupMetadata(from); admins = groupMeta.participants.filter(p => p.admin).map(p => p.id); } catch {}
      }
      const isSenderAdmin = admins.includes(sender);
      const isOwner = sender && sender.includes(CONFIG.ownerNumber.replace(/\D/g,''));

      // COMMANDS
      switch (cmd) {

        // ---------------- MENU ----------------
        case 'menu':
          {
            const caption = buildMenu(pushName || message.pushName || 'there');
            const imagePath = path.join(CONFIG.mediaFolder, 'botpic.jpeg');
            if (fs.existsSync(imagePath)) {
              await sock.sendMessage(from, { image: fs.readFileSync(imagePath), caption }, { quoted: message });
            } else {
              await sock.sendMessage(from, { text: caption }, { quoted: message });
            }
          }
          break;

        // ---------------- PING ----------------
        case 'ping':
          await reply('Pong! ✅');
          break;

        // ---------------- REPO ----------------
        case 'repo':
          await reply(`GitHub: https://github.com/tunzy-shop/TUNZY-MD-V1\nChannel: ${CONFIG.channelLink}`);
          break;

        // ---------------- OWNER CONTACT ----------------
        case 'owner':
          await sock.sendMessage(from, {
            contacts: [{ displayName: CONFIG.ownerName, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${CONFIG.ownerName}\nTEL;type=CELL:${CONFIG.ownerNumber}\nEND:VCARD` }]
          }, { quoted: message });
          break;

        // ---------------- PLAY (audio/video options) ----------------
        // usage: .play <query> -> by default audio (mp3). .playvideo <query> to get video watermarked
        case 'play':
        case 'playvideo':
          {
            if (!args.length) return reply('Usage: .play <song name>  OR  .playvideo <song name>');
            const q = args.join(' ');
            await reply(`Searching YouTube for "${q}"...`);
            try {
              const ytres = await yts(q);
              const v = ytres.videos && ytres.videos.length ? ytres.videos[0] : null;
              if (!v) return reply('No video result found.');
              const infoUrl = v.url;
              // if play (audio)
              if (cmd === 'play') {
                // download audio as mp3 using ytdl-core
                const tmpAudio = path.join(CONFIG.tmpFolder, `audio_${Date.now()}.mp3`);
                await new Promise((res, rej) => {
                  const stream = ytdl(infoUrl, { filter: 'audioonly', quality: 'highestaudio' });
                  const ff = exec(`${FFMPEG_PATH} -i pipe:0 -vn -b:a 128k -f mp3 "${tmpAudio}"`, { shell: true }, (err) => err ? rej(err) : res());
                  stream.pipe(ff.stdin);
                });
                await sock.sendMessage(from, { audio: fs.readFileSync(tmpAudio), mimetype: 'audio/mpeg', fileName: `${v.title}.mp3` }, { quoted: message });
                try { fs.unlinkSync(tmpAudio); } catch {}
              } else {
                // playvideo -> download video and watermark it, then send
                await reply('Downloading video & applying watermark, please wait...');
                // download to temp
                const tmpVid = path.join(CONFIG.tmpFolder, `vid_${Date.now()}.mp4`);
                await new Promise((res, rej) => {
                  const stream = ytdl(infoUrl, { quality: 'highestvideo' });
                  const ws = fs.createWriteStream(tmpVid);
                  stream.pipe(ws);
                  ws.on('finish', res);
                  ws.on('error', rej);
                });
                const wm = await addWatermarkVideo(tmpVid, CONFIG.watermarkText);
                await sock.sendMessage(from, { video: fs.readFileSync(wm), caption: v.title }, { quoted: message });
                try { fs.unlinkSync(tmpVid); fs.unlinkSync(wm); } catch {}
              }
            } catch (e) {
              console.error('play error', e);
              await reply('Error processing .play request.');
            }
          }
          break;

        // ---------------- TIKTOK (no watermark original download) + watermarked send ----------------
        case 'tiktok':
          {
            if (!args[0]) return reply('Usage: .tiktok <link>');
            const link = args[0];
            await reply('Downloading TikTok (may take a few seconds)...');
            try {
              // use a public API that returns no watermark; if fails, fallback to video field
              const res = await axios.get(`https://api.tiklydown.me/api/download?url=${encodeURIComponent(link)}`);
              const noWM = res.data.video && (res.data.video.noWatermark || res.data.video.url);
              if (!noWM) return reply('Cannot fetch TikTok video.');
              // watermark the downloaded URL
              const wmFile = await addWatermarkVideo(noWM, CONFIG.watermarkText);
              await sock.sendMessage(from, { video: fs.readFileSync(wmFile), caption: 'TikTok (watermarked)' }, { quoted: message });
              try { fs.unlinkSync(wmFile); } catch {}
            } catch (e) {
              console.error('tiktok error', e?.message || e);
              await reply('Failed to download TikTok.');
            }
          }
          break;

        // ---------------- HD / HD2 / VV / VV2 (reply-based) ----------------
        case 'vv':
        case 'vv2':
        case 'hd':
        case 'hd2':
          {
            // require quoted message with media
            const quoted = message.extendedTextMessage?.contextInfo?.quotedMessage || null;
            if (!quoted) return reply(`Kindly reply to the media with ${CONFIG.prefix}${cmd}`);
            // download quoted media
            try {
              // use sock.downloadMediaMessage utility exposed by Baileys; but here we will attempt to fetch content via axios if url present or process Buffer if provided
              // Baileys provides download, but in this single-file we attempt to get the media content from the quoted context (some builds differ)
              const mediaKey = message.extendedTextMessage.contextInfo;
              // fallback approach: try to request the quoted as a buffer via sock.download
              // For compatibility, request the message content using global ev listeners is complex — we use a best-effort approach:
              // If quoted has imageMessage/videoMessage, the library usually has a download function; but here we will attempt to forward the quoted to owner for processing OR tell user to use simple workflow.
              // Simpler approach: ask user to forward media as normal message (not view-once) and then reply .vv etc.
              // We'll attempt to use sock.downloadMediaMessage if available:
              if (typeof sock.downloadMediaMessage === 'function') {
                const buffer = await sock.downloadMediaMessage({ message: quoted }, 'buffer', {});
                const filename = path.join(CONFIG.tmpFolder, `${cmd}_${Date.now()}.mp4`);
                fs.writeFileSync(filename, buffer);
                const wm = await addWatermarkVideo(filename, CONFIG.watermarkText);
                await sock.sendMessage(from, { video: fs.readFileSync(wm) }, { quoted: message });
                try { fs.unlinkSync(filename); fs.unlinkSync(wm); } catch {}
              } else {
                return reply(`Sorry, your bot build does not expose media download helper. Use normal media and try again.`);
              }
            } catch (e) {
              console.error(`${cmd} error`, e);
              return reply(`Failed to process media for ${cmd}.`);
            }
          }
          break;

        // ---------------- TAG / HIDETAG / TAGALL ----------------
        case 'tag':
          {
            const mentions = message.extendedTextMessage?.contextInfo?.mentionedJid || parseMentionsFromText(text);
            if (!mentions.length) return reply('Mention or reply to user to tag.');
            await sock.sendMessage(from, { text: `@${mentions[0].split('@')[0]}`, mentions }, { quoted: message });
          }
          break;

        case 'hidetag':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            const members = (groupMeta?.participants || []).map(p => p.id);
            await sock.sendMessage(from, { text: args.join(' ') || ' ', mentions: members }, { quoted: message });
          }
          break;

        case 'tagall':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            const members = (groupMeta?.participants || []).map(p => p.id);
            await sock.sendMessage(from, { text: '📣 Tagging all', mentions: members }, { quoted: message });
          }
          break;

        // ---------------- ADD / KICK / PROMOTE / DEMOTE ----------------
        case 'add':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            if (!args[0]) return reply('Usage: .add +234XXXXXXXX');
            const num = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
            try { await sock.groupParticipantsUpdate(from, [num], 'add'); reply('Added.'); } catch (e) { reply('Failed to add — I must be admin.'); }
          }
          break;

        case 'kick':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            const targets = message.extendedTextMessage?.contextInfo?.mentionedJid || parseMentionsFromText(text);
            if (!targets.length) return reply('Reply or mention user(s) to kick.');
            try { await sock.groupParticipantsUpdate(from, targets, 'remove'); reply('Kicked.'); } catch (e) { reply('Failed — I need admin.'); }
          }
          break;

        case 'promote':
        case 'demote':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            const targets = message.extendedTextMessage?.contextInfo?.mentionedJid || parseMentionsFromText(text);
            if (!targets.length) return reply('Reply or mention user(s).');
            const act = cmd === 'promote' ? 'promote' : 'demote';
            try { await sock.groupParticipantsUpdate(from, targets, act); reply(`${cmd} done.`); } catch (e) { reply('Failed — I need admin.'); }
          }
          break;

        // ---------------- OPEN / CLOSE ----------------
        case 'open':
          if (!isSenderAdmin) return reply('Admin only.');
          try { await sock.groupSettingUpdate(from, 'not_announcement'); reply('Group is open.'); } catch (e) { reply('Failed to change group setting.'); }
          break;
        case 'close':
          if (!isSenderAdmin) return reply('Admin only.');
          try { await sock.groupSettingUpdate(from, 'announcement'); reply('Group closed (admins only).'); } catch (e) { reply('Failed to change group setting.'); }
          break;

        // ---------------- ACCEPT ALL (placeholder) ----------------
        case 'accept':
          if (args[0] === 'all') {
            if (!isSenderAdmin) return reply('Admin only.');
            // acceptance flow depends on group invite system; placeholder:
            reply('Accepted all pending (placeholder).');
          }
          break;

        // ---------------- DEL (delete message) ----------------
        case 'del':
          {
            // reply to message and use key to delete
            const quotedKey = message.extendedTextMessage?.contextInfo;
            if (!quotedKey) return reply('Reply to a message and use .del');
            try {
              await sock.sendMessage(from, { delete: quotedKey });
              reply('Deleted (if permitted).');
            } catch (e) { reply('Failed to delete.'); }
          }
          break;

        // ---------------- LIST ADMIN / LIST ONLINE ----------------
        case 'list':
          {
            if (args[0] === 'admin') {
              try {
                const meta = await sock.groupMetadata(from);
                const adminsList = meta.participants.filter(p => p.admin).map(p => p.id);
                let out = '👑 Group admins:\n\n' + adminsList.map(a => `@${a.split('@')[0]}`).join('\n');
                await sock.sendMessage(from, { text: out, mentions: adminsList }, { quoted: message });
              } catch (e) { reply('Failed to fetch admins.'); }
            } else if (args[0] === 'online') {
              try {
                const meta = await sock.groupMetadata(from);
                // Baileys exposes presence only when available for participants object in some versions; this may be undefined
                const online = meta.participants.filter(p => p.isOnline).map(p => p.id);
                if (!online || online.length === 0) return reply('No online members (or presence data unavailable).');
                let out = `🟢 Online (${online.length}):\n\n` + online.map(a => `@${a.split('@')[0]}`).join('\n');
                await sock.sendMessage(from, { text: out, mentions: online }, { quoted: message });
              } catch (e) { reply('Failed to fetch online list.'); }
            }
          }
          break;

        // ---------------- ANTILINK CONTROL ----------------
        case 'antilink':
          {
            if (!isSenderAdmin) return reply('Admin only.');
            // commands: .antilink set delete|kick|warn  OR .antilink off
            if (args[0] === 'set' && args[1]) {
              const mode = args[1];
              if (!['delete','kick','warn'].includes(mode)) return reply('Mode must be delete|kick|warn');
              DB.antilink = DB.antilink || {};
              DB.antilink[from] = DB.antilink[from] || { mode: 'off', warns: {} };
              DB.antilink[from].mode = mode;
              saveDB();
              return reply(`Antilink mode set to ${mode}`);
            } else if (args[0] === 'off') {
              DB.antilink = DB.antilink || {};
              DB.antilink[from] = DB.antilink[from] || { mode: 'off', warns: {} };
              DB.antilink[from].mode = 'off';
              saveDB();
              return reply('Antilink turned off');
            } else if (args[0] === 'warn' && args[1]) {
              DB.antilink = DB.antilink || {};
              DB.antilink[from] = DB.antilink[from] || { mode: 'warn', warns: {} };
              DB.antilink[from].mode = 'warn';
              saveDB();
              return reply('Antilink set to warn mode (3 warns will remove)');
            } else {
              return reply('Usage: .antilink set <delete|kick|warn> OR .antilink off');
            }
          }
          break;

        // ---------------- OWNER ONLY ----------------
        case 'restart':
          if (!isOwner) return reply('Owner only.');
          reply('Restarting...');
          process.exit(0);
          break;

        case 'save':
          if (!isOwner) return reply('Owner only.');
          // placeholder: trigger DB save
          saveDB();
          reply('Saved DB.');
          break;

        case 'ban':
          if (!isOwner) return reply('Owner only.');
          {
            const targets = message.extendedTextMessage?.contextInfo?.mentionedJid || parseMentionsFromText(text);
            if (!targets.length) return reply('Reply/mention user to ban.');
            DB.banned = DB.banned || [];
            DB.banned.push(...targets);
            saveDB();
            reply('User(s) banned.');
          }
          break;

        case 'unban':
          if (!isOwner) return reply('Owner only.');
          {
            const targets = message.extendedTextMessage?.contextInfo?.mentionedJid || parseMentionsFromText(text);
            if (!targets.length) return reply('Reply/mention user to unban.');
            DB.banned = (DB.banned || []).filter(x => !targets.includes(x));
            saveDB();
            reply('User(s) unbanned.');
          }
          break;

        case 'block':
          if (!isOwner) return reply('Owner only.');
          {
            const t = parseMentionsFromText(text)[0];
            if (!t) return reply('Mention number to block.');
            try { await sock.updateBlockStatus(t, 'block'); reply('Blocked.'); } catch { reply('Failed to block.'); }
          }
          break;

        case 'mode':
          if (!isOwner) return reply('Owner only.');
          if (!args[0]) return reply('Usage: .mode public OR .mode private');
          DB.settings = DB.settings || {};
          DB.settings.mode = args[0] === 'private' ? 'private' : 'public';
          saveDB();
          reply('Mode set to ' + DB.settings.mode);
          break;

        default:
          // unknown command — ignore
          break;
      } // end switch

    } catch (err) {
      console.error('message handler error', err);
    }
  });

  // save creds
  sock.ev.on('creds.update', saveCreds);

  return sock;
} // end startBot

// run
startBot().catch(e => {
  console.error('start error', e);
  process.exit(1);
});