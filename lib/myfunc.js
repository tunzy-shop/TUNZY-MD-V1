const fs = require('fs')
const axios = require('axios')
const path = require('path')

function smsg(sock, m, store) {
    return {
        ...m,
        id: m.key.id,
        from: m.key.remoteJid,
        isGroup: m.key.remoteJid.endsWith('@g.us'),
        sender: m.key.participant || m.key.remoteJid,
        pushName: m.pushName || '',
        message: m.message,
        chat: store.chats ? store.chats[m.key.remoteJid] : {},
    }
}

function isUrl(url) {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/, 'gi'))
}

function getBuffer(url) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data, 'binary'))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function reSize(buffer, width, height) {
    const sharp = require('sharp')
    return await sharp(buffer).resize(width, height).toBuffer()
}

module.exports = { smsg, isUrl, getBuffer, sleep, reSize }
