const fs = require("fs");
const dbFile = "./lib/db.json";

function loadDB() {
    if (!fs.existsSync(dbFile)) return { users: {}, groups: {} };
    return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(db) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

module.exports = { loadDB, saveDB };