const fs = require("fs");
const path = require("path");

module.exports = {
    saveJSON: (file, data) => {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    },
    loadJSON: (file) => {
        if (!fs.existsSync(file)) return {};
        return JSON.parse(fs.readFileSync(file));
    },
    delay: ms => new Promise(resolve => setTimeout(resolve, ms)),
}