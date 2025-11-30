/**
 * TUNZY MD BOT - WhatsApp Bot
 * Edited & Customized for Tunzy Shop
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by DGXEON
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// STORE
const store = require('./lib/lightweight_store')
store.readFromFile()

const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

global.botname = "TUNZY MD BOT"
global.themeemoji = "🔥"
let phoneNumber = "2349067345425"  // Your number
let owner = [ "2349067345425" ]    // Owner JSON not needed

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => rl ? new Promise(resolve => rl.question(text, resolve)) : Promise.resolve(settings.ownerNumber || phoneNumber)

async function startTunzyBot() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const conn = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: ["TunzyMd", "Chrome", "1.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            syncFullHistory: false,
            generateHighQualityLinkPreview: true,
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })

        conn.ev.on('creds.update', saveCreds)
        store.bind(conn.ev)

        // ****** MESSAGE HANDLING *******
        conn.ev.on('messages.upsert', async chat => {
            try {
                const msg = chat.messages[0]
                if (!msg.message) return

                msg.message = Object.keys(msg.message)[0] === 'ephemeralMessage'
                    ? msg.message.ephemeralMessage.message
                    : msg.message

                if (msg.key.remoteJid === 'status@broadcast') {
                    await handleStatus(conn, chat)
                    return
                }

                await handleMessages(conn, chat, true)

            } catch (err) {
                console.log(err)
            }
        })

        // ****** PAIRING CODE ******
        if (pairingCode && !conn.authState.creds.registered) {
            let number = phoneNumber.replace(/[^0-9]/g, '')

            setTimeout(async () => {
                let code = await conn.requestPairingCode(number)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.green("PAIRING CODE →"), code)
            }, 3000)
        }

        // ****** CONNECTION EVENTS ******
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update

            if (connection === "open") {
                console.log(chalk.green("💚 TUNZY MD BOT CONNECTED!"))
                const me = conn.user.id.split(":")[0] + "@s.whatsapp.net"
                await conn.sendMessage(me, { 
                    text: `🔥 TUNZY MD BOT ONLINE\n\nTime: ${new Date().toLocaleString()}`
                })
            }

            if (connection === "close") {
                const reason = lastDisconnect?.error?.output?.statusCode
                if (reason === DisconnectReason.loggedOut) {
                    rmSync('./session', { recursive: true, force: true })
                }
                setTimeout(() => startTunzyBot(), 2000)
            }
        })

        // GROUP EVENTS
        conn.ev.on('group-participants.update', async (u) => {
            await handleGroupParticipantUpdate(conn, u)
        })

        return conn
    } catch (e) {
        console.log("BOT ERROR:", e)
        startTunzyBot()
    }
}

startTunzyBot()
