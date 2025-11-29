const fs = require('fs');
const path = require('path');
const dbFile = path.join(__dirname, 'database.json');

module.exports = {
    readDB: () => {
        if (!fs.existsSync(dbFile)) return {};
        return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    },

    writeDB: (data) => {
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
    },

    addWarn: (groupId, userId) => {
        const db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf-8')) : {};
        if (!db[groupId]) db[groupId] = {};
        if (!db[groupId][userId]) db[groupId][userId] = 0;
        db[groupId][userId] += 1;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
        return db[groupId][userId];
    },

    resetWarn: (groupId, userId) => {
        const db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf-8')) : {};
        if (db[groupId] && db[groupId][userId]) db[groupId][userId] = 0;
        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    }
}