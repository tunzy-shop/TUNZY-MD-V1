/**
 * TUNZY-MD-V1 index.js
 * Pairing code only (no QR), full command set
 */

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const config = require('./config');
const { sendMenu, mentionFromText, getGroupAnti, setAntiMode, warnUser, clearWarns, data, save } = require('./lib/functions');
const db = require('./lib/database');

const SESSION_DIR = config.sessionFolder || './tmp';
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(SESSION_DIR, 'auth_info'));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false, // do not print QR
    auth: state,
    version
  });

  // If not registered yet, request pairing code flow (Baileys servers should accept)
  // Some Baileys builds expose requestPairingCode — we attempt if available.
  try {
    if (!state.creds?.registered && typeof sock.requestPairingCode === 'function') {
      // ask user in console for phone number
      process.stdout.write('Enter phone number (country code, e.g. 2349xxxxxxxxx): ');
      process.stdin.once('data', async (d) => {
        const num = d.toString().trim().replace(/\D/g, '');
        try {
          const pairing = await sock.requestPairingCode(num);
          console.log(chalk.green('\nPairing code:'));
          console.log(chalk.yellow(pairing));
          console.log(chalk.blue('\nOpen WhatsApp → Settings → Linked devices → Link a device → Enter the code above.'));
        } catch (e) {
          console.error('Pairing code error:', e?.message || e);
        }
      });
    }
  } catch (e) {
    // ignore if not supported
  }

  sock.ev.on('creds.update', saveCreds);

  // reconnect handler
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('Connection closed unexpectedly — restarting...', code);
        start();
      } else {
        console.log('Logged out. Remove session files and re-run.');
      }
    } else if (connection === 'open') {
      console.log(chalk.green('TUNZY-MD-V1 is online ✅'));
      // optional: auto-join group link (just send invite to owner)
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg || !msg.message) return;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const pushName = msg.pushName || 'there';

      // Get text (conversation or extendedText -> text or image caption)
      let text = '';
      const mkeys = Object.keys(msg.message);
      if (msg.message.conversation) text = msg.message.conversation;
      else if (msg.message.extendedTextMessage?.text) text = msg.message.extendedTextMessage.text;
      else if (msg.message.imageMessage?.caption) text = msg.message.imageMessage.caption;
      text = text?.trim() || '';

      // helper replies
      const reply = async (content) => sock.sendMessage(from, { text: content }, { quoted: msg });

      // handle banned users
      if (db.data.banned.includes(sender)) return;

      // ANTI-LINK check (group only)
      if (isGroup) {
        const anti = getGroupAnti(from);
        if (anti && anti.mode && anti.mode !== 'off') {
          const linkRegex = /(https?:\/\/[^\s]+)/i;
          if (linkRegex.test(text)) {
            // admin exemption
            let isSenderAdmin = false;
            try {
              const metadata = await sock.groupMetadata(from);
              const part = metadata.participants.find(p => p.id === sender);
              isSenderAdmin = part?.admin ? true : false;
            } catch (e) { /* ignore */ }

            if (!isSenderAdmin) {
              if (anti.mode === 'delete') {
                // attempt to delete message (Baileys needs message key)
                try { await sock.sendMessage(from, { text: `⚠️ Link detected — message should be deleted (bot cannot delete non-quoted messages if not admin).` }); } catch {}
              } else if (anti.mode === 'kick') {
                try {
                  await sock.groupParticipantsUpdate(from, [sender], 'remove');
                  await sock.sendMessage(from, { text: `🚫 Removed ${sender.split('@')[0]} for posting a link.` });
                } catch (e) {
                  await sock.sendMessage(from, { text: `⚠ I need admin to kick.` });
                }
              } else if (anti.mode === 'warn') {
                const warns = warnUser(from, sender);
                await sock.sendMessage(from, { text: `⚠ Warning ${warns}/3 for posting link.` });
                if (warns >= 3) {
                  try {
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                    clearWarns(from, sender);
                    await sock.sendMessage(from, { text: `🚫 Removed ${sender.split('@')[0]} after 3 warnings.` });
                  } catch (e) {
                    await sock.sendMessage(from, { text: `⚠ I need admin to remove user.` });
                  }
                }
              }
            }
          }
        }
      }

      // parse command
      const prefix = config.prefix || '.';
      if (!text.startsWith(prefix)) return;

      const args = text.slice(prefix.length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();

      // get group metadata for admin checks when needed
      let groupMeta = null;
      let groupAdmins = [];
      if (isGroup) {
        try {
          groupMeta = await sock.groupMetadata(from);
          groupAdmins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        } catch (e) { /* ignore */ }
      }
      const isSenderAdmin = groupAdmins.includes(sender);
      const isOwner = sender.includes(config.ownerNumber.replace(/\D/g, ''));

      // ---------------- COMMANDS ----------------

      // MENU
      if (cmd === 'menu') {
        await sendMenu(sock, from, msg.pushName || pushName);
        return;
      }

      // PING
      if (cmd === 'ping') return reply('Pong! ✅');

      // REPO
      if (cmd === 'repo') return reply(`GitHub Repo: https://github.com/tunzy-shop/TUNZY-MD-V1\nChannel: ${config.channelLink}`);

      // OWNER CONTACT
      if (cmd === 'owner') {
        return sock.sendMessage(from, {
          contacts: [{ displayName: config.ownerName, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nTEL;type=CELL:${config.ownerNumber}\nEND:VCARD` }]
        });
      }

      // PLAY - placeholder (implement download service if you want)
      if (cmd === 'play') {
        if (!args.length) return reply('Usage: .play <song name>');
        const q = args.join(' ');
        // placeholder response - implement ytdl or music API to fetch audio
        return reply(`🔊 Playing / searching: ${q}\n(Feature placeholder — implement downloader to send audio file)`);
      }

      // HD / HD2 / VV / VV2 instructions
      if (['hd','hd2','vv','vv2'].includes(cmd)) {
        return reply(`To use ${prefix}${cmd} please *reply* to the media or send the link. Example:\n- Reply to an image and type ${prefix}${cmd}\n- Or use ${prefix}vv followed by a link`);
      }

      // TIKTOK (no watermark) - placeholder
      if (cmd === 'tiktok') {
        if (!args[0]) return reply('Usage: .tiktok <link>');
        const link = args[0];
        // implement your tiktok downloader to return url/file; placeholder:
        return reply(`⬇ Downloading TikTok (no watermark): ${link}\n(Feature placeholder — implement downloader)`);
      }

      // SAVE (forward media to owner and save locally)
      if (cmd === 'save') {
        // requires that message is a reply with media
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return reply('Reply to a media with .save to forward to owner.');
        try {
          const buffer = await sock.downloadMediaMessage({ message: quoted }, 'buffer', {});
          // forward to owner
          await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', { document: buffer, fileName: 'saved_media' });
          return reply('Saved and forwarded to owner.');
        } catch (e) {
          return reply('Failed to save media.');
        }
      }

      // ---------------- GROUP (admin) commands ----------------
      // tag (mention single)
      if (cmd === 'tag') {
        // support mention by reply or by number in args
        const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || mentionFromText(text);
        if (!mentions || mentions.length === 0) return reply('Reply or mention the user to tag.');
        return sock.sendMessage(from, { text: `@${mentions[0].split('@')[0]}`, mentions });
      }

      // hidetag
      if (cmd === 'hidetag') {
        if (!isSenderAdmin) return reply('Admin only');
        const groupMembers = groupMeta.participants.map(p => p.id);
        return sock.sendMessage(from, { text: args.join(' ') || ' ', mentions: groupMembers });
      }

      // tagall
      if (cmd === 'tagall') {
        if (!isSenderAdmin) return reply('Admin only');
        const mems = groupMeta.participants.map(p => p.id);
        return sock.sendMessage(from, { text: `📣 Tagging all`, mentions: mems });
      }

      // add
      if (cmd === 'add') {
        if (!isSenderAdmin) return reply('Admin only');
        if (!args[0]) return reply('Usage: .add +234XXXXXXXXX');
        const num = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
        try { await sock.groupParticipantsUpdate(from, [num], 'add'); return reply('Member added.'); } catch(e){ return reply('Failed to add. Bot must be admin.'); }
      }

      // kick
      if (cmd === 'kick') {
        if (!isSenderAdmin) return reply('Admin only');
        const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || mentionFromText(text);
        if (!target || target.length === 0) return reply('Reply/mention who to kick.');
        try { await sock.groupParticipantsUpdate(from, target, 'remove'); return reply('Kicked.'); } catch(e){ return reply('Failed to kick. Bot needs admin.'); }
      }

      // promote / demote
      if (cmd === 'promote' || cmd === 'demote') {
        if (!isSenderAdmin) return reply('Admin only');
        const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || mentionFromText(text);
        if (!target || target.length === 0) return reply('Reply/mention who to promote/demote.');
        const action = cmd === 'promote' ? 'promote' : 'demote';
        try { await sock.groupParticipantsUpdate(from, target, action); return reply(`${cmd} success.`); } catch(e) { return reply('Failed. Bot needs admin.'); }
      }

      // open / close
      if (cmd === 'open') {
        if (!isSenderAdmin) return reply('Admin only');
        try { await sock.groupSettingUpdate(from, 'not_announcement'); return reply('Group opened to all members.'); } catch(e){ return reply('Failed to change settings.'); }
      }
      if (cmd === 'close') {
        if (!isSenderAdmin) return reply('Admin only');
        try { await sock.groupSettingUpdate(from, 'announcement'); return reply('Group closed (admins only).'); } catch(e){ return reply('Failed to change settings.'); }
      }

      // accept all (placeholder: depends on incoming group approvals)
      if (cmd === 'accept' && args[0] === 'all') {
        if (!isSenderAdmin) return reply('Admin only');
        return reply('Accepted all pending (placeholder).');
      }

      // del - delete message (bot must be admin and have message id to delete; placeholder)
      if (cmd === 'del') {
        return reply('Use reply to the message and .del (placeholder - implement message delete).');
      }

      // list admin / list online
      if (cmd === 'list' && args[0] === 'admin') {
        try {
          const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
          return reply('Admins:\n' + admins.join('\n'));
        } catch (e) { return reply('Cannot fetch admins.'); }
      }
      if (cmd === 'list' && args[0] === 'online') {
        return reply('List online not implemented (WhatsApp does not expose presence for all members).');
      }

      // ---------------- ANTI-LINK admin control ----------------
      if (cmd === 'antilink') {
        if (!isSenderAdmin) return reply('Admin only');
        // .antilink set delete | kick | warn | off
        if (args[0] === 'set' && args[1]) {
          const mode = args[1]; // delete | kick | warn
          if (['delete','kick','warn'].includes(mode)) {
            setAntiMode(from, mode);
            return reply(`Antilink set to: ${mode}`);
          } else return reply('Unknown mode: use delete | kick | warn');
        }
        if (args[0] === 'off') {
          setAntiMode(from, 'off');
          return reply('Antilink turned off');
        }
        if (args[0] === 'warn' && args[1]) {
          // .antilink warn 3 -> sets warn mode and threshold handled via warnUser
          setAntiMode(from, 'warn');
          return reply('Antilink set to warn mode (3 warns will remove user).');
        }
        return reply('Usage: .antilink set <delete|kick|warn> | .antilink off');
      }

      // ---------------- OWNER commands ----------------
      if (isOwner) {
        if (cmd === 'restart') {
          reply('Restarting bot...');
          process.exit(0);
        }
        if (cmd === 'ban') {
          const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || mentionFromText(text);
          if (!target || target.length === 0) return reply('Reply/mention user to ban');
          db.data.banned.push(...target);
          save();
          return reply('User(s) banned.');
        }
        if (cmd === 'unban') {
          const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || mentionFromText(text);
          if (!target || target.length === 0) return reply('Reply/mention user to unban');
          db.data.banned = db.data.banned.filter(b => !target.includes(b));
          save();
          return reply('User(s) unbanned.');
        }
        if (cmd === 'block') {
          const t = mentionFromText(text)[0];
          if (!t) return reply('Mention number to block.');
          await sock.updateBlockStatus(t, 'block');
          return reply('Blocked user.');
        }
        if (cmd === 'mode') {
          // .mode public or .mode private
          if (!args[0]) return reply('Usage: .mode public | private');
          const m = args[0] === 'public' ? 'public' : 'private';
          db.data.settings.mode = m;
          save();
          return reply('Mode set to ' + m);
        }
      }

    } catch (err) {
      console.error('message handler error', err);
    }
  });

  // save creds
  sock.ev.on('creds.update', saveCreds);
}

// start
start().catch(e => console.error(e));