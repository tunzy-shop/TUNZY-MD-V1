const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, generatePairingCode, DisconnectReason, jidNormalizedUser } = require('@adiwajshing/baileys')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const config = require('./config')
const { getMenu } = require('./lib/functions')
const store = makeInMemoryStore({})

const TMP_DIR = './tmp'
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)
const SESSION_FILE = path.join(TMP_DIR, 'session.json')
const { state, saveState } = useSingleFileAuthState(SESSION_FILE)

async function start() {
    const { version } = await fetchLatestBaileysVersion()

    const client = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false // No QR code
    })

    store.bind(client.ev)

    // Generate pairing code if no session
    if (!fs.existsSync(SESSION_FILE) || fs.statSync(SESSION_FILE).size === 0) {
        const pairing = generatePairingCode()
        console.log(chalk.yellowBright(`\n📌 Pairing code generated:\n${pairing}\n`))
        console.log(chalk.green(`➡ Go to WhatsApp Settings → Linked Devices → Link a Device → Enter this code`))
    }

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log(chalk.red(`Connection closed, restarting... Reason: ${reason}`))
            start()
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Bot connected successfully!'))
        }
    })

    client.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return

        const from = msg.key.remoteJid
        const sender = jidNormalizedUser(msg.key.participant || msg.key.remoteJid)
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const senderName = msg.pushName || 'Friend'

        // === PUBLIC COMMANDS ===
        if (text.startsWith('.menu')) {
            await client.sendMessage(from, { text: getMenu(senderName, config) })
        }
        if (text.startsWith('.ping')) {
            await client.sendMessage(from, { text: '🏓 Pong!' })
        }
        if (text.startsWith('.play')) {
            const query = text.replace('.play ', '')
            await client.sendMessage(from, { text: `🔊 Playing: ${query}` })
        }
        if (text.startsWith('.tiktok')) {
            const link = text.replace('.tiktok ', '')
            await client.sendMessage(from, { text: `⬇ Downloading TikTok: ${link}` })
        }
        if (text.startsWith('.save')) {
            await client.sendMessage(from, { text: `💾 Saved your request.` })
        }
        if (text.startsWith('.repo')) {
            await client.sendMessage(from, { text: `📂 Repo: ${config.repoLink}` })
        }
        if (text.startsWith('.owner')) {
            await client.sendMessage(from, { text: `Owner: ${config.ownerName} (${config.ownerNumber})` })
        }

        // === GROUP COMMANDS ===
        if (text.startsWith('.gc link')) {
            try {
                const metadata = await client.groupMetadata(from)
                await client.sendMessage(from, { text: `🔗 Group link: ${metadata.inviteCode || 'No link found'}` })
            } catch { return }
        }
        if (text.startsWith('.list admin')) {
            try {
                const metadata = await client.groupMetadata(from)
                const admins = metadata.participants.filter(p => p.admin).map(a => a.id)
                await client.sendMessage(from, { text: `👑 Admins:\n${admins.join('\n')}` })
            } catch { return }
        }
        if (text.startsWith('.list online')) {
            await client.sendMessage(from, { text: '🟢 Online list not implemented' })
        }

        // === ADMIN COMMANDS ===
        if (text.startsWith('.add')) {
            const number = text.replace('.add ', '').replace(/\D/g, '') + '@s.whatsapp.net'
            await client.groupParticipantsUpdate(from, [number], 'add')
        }
        if (text.startsWith('.kick')) {
            const number = text.replace('.kick ', '').replace(/\D/g, '') + '@s.whatsapp.net'
            await client.groupParticipantsUpdate(from, [number], 'remove')
        }
        if (text.startsWith('.promote')) {
            const number = text.replace('.promote ', '').replace(/\D/g, '') + '@s.whatsapp.net'
            await client.groupParticipantsUpdate(from, [number], 'promote')
        }
        if (text.startsWith('.demote')) {
            const number = text.replace('.demote ', '').replace(/\D/g, '') + '@s.whatsapp.net'
            await client.groupParticipantsUpdate(from, [number], 'demote')
        }
        if (text.startsWith('.tag')) {
            await client.sendMessage(from, { text: `@${sender.split('@')[0]}`, mentions: [sender] })
        }
        if (text.startsWith('.tagall')) {
            try {
                const metadata = await client.groupMetadata(from)
                const members = metadata.participants.map(p => p.id)
                const mentions = members
                await client.sendMessage(from, { text: `👥 Attention everyone!`, mentions })
            } catch { }
        }
        if (text.startsWith('.hidetag')) {
            try {
                const metadata = await client.groupMetadata(from)
                const members = metadata.participants.map(p => p.id)
                await client.sendMessage(from, { text: '🤫 Hidden tag', mentions: members })
            } catch { }
        }
        if (text.startsWith('.accept all')) {
            await client.sendMessage(from, { text: '✅ All requests accepted (placeholder)' })
        }
        if (text.match(/https?:\/\/chat.whatsapp.com\/\S+/gi)) {
            const isAntilinkOn = true
            if (isAntilinkOn) {
                await client.sendMessage(from, { text: '⚠️ Group link detected! You will be removed.' })
                await client.groupParticipantsUpdate(from, [sender], 'remove')
            }
        }
        if (text.startsWith('.open')) await client.groupSettingUpdate(from, 'not_announcement')
        if (text.startsWith('.close')) await client.groupSettingUpdate(from, 'announcement')

        // === OWNER COMMANDS ===
        if (sender === config.ownerNumber.replace(/\D/g, '')) {
            if (text.startsWith('.ban')) {}
            if (text.startsWith('.unban')) {}
            if (text.startsWith('.block')) {}
            if (text.startsWith('.anticall')) {}
            if (text.startsWith('.mode')) {}
        }
    })

    client.ev.on('creds.update', saveState)
}

start()