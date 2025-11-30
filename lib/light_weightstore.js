const fs = require('fs')
const path = require('path')

let store = {
    messages: {},
    contacts: {},
    groups: {}
}

function readFromFile() {
    const file = path.join(__dirname, '../tmp/store.json')
    if (fs.existsSync(file)) {
        store = JSON.parse(fs.readFileSync(file))
    }
}

function writeToFile() {
    const file = path.join(__dirname, '../tmp/store.json')
    fs.writeFileSync(file, JSON.stringify(store, null, 2))
}

function bind(ev) {
    ev.on('messages.upsert', async ({ messages }) => {
        for (let msg of messages) {
            if (!msg.key.id) continue
            store.messages[msg.key.id] = msg
        }
    })
}

async function loadMessage(jid, id) {
    return store.messages[id] || null
}

module.exports = { store, readFromFile, writeToFile, bind, loadMessage }
