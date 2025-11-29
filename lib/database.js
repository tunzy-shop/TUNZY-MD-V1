// lib/database.js
const fs = require("fs");
const dbFile = "./lib/database.json";

if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({
    users: {},
    groups: {},
}));

function readDB() {
    return JSON.parse(fs.readFileSync(dbFile));
}

function writeDB(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// User warning system
function addWarning(groupId, userId) {
    const db = readDB();
    db.groups[groupId] = db.groups[groupId] || {};
    db.groups[groupId].warnings = db.groups[groupId].warnings || {};
    db.groups[groupId].warnings[userId] = (db.groups[groupId].warnings[userId] || 0) + 1;
    writeDB(db);
    return db.groups[groupId].warnings[userId];
}

function resetWarnings(groupId, userId) {
    const db = readDB();
    if (db.groups[groupId] && db.groups[groupId].warnings[userId]) {
        db.groups[groupId].warnings[userId] = 0;
        writeDB(db);
    }
}

function getWarnings(groupId, userId) {
    const db = readDB();
    return db.groups[groupId]?.warnings[userId] || 0;
}

// Antilink toggle
function setAntiLink(groupId, value) {
    const db = readDB();
    db.groups[groupId] = db.groups[groupId] || {};
    db.groups[groupId].antilink = value; // true/false
    writeDB(db);
}

function getAntiLink(groupId) {
    const db = readDB();
    return db.groups[groupId]?.antilink || false;
}

// Export functions
module.exports = {
    readDB,
    writeDB,
    addWarning,
    resetWarnings,
    getWarnings,
    setAntiLink,
    getAntiLink,
};