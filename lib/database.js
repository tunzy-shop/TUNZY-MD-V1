const fs = require('fs');
const path = './lib/database.json';

let database = {
    antilink: []  // Stores group IDs with antilink active
};

// Load DB if exists
if (fs.existsSync(path)) {
    database = JSON.parse(fs.readFileSync(path));
}

// Save function
function saveDB() {
    fs.writeFileSync(path, JSON.stringify(database, null, 2));
}

module.exports = { database, saveDB };