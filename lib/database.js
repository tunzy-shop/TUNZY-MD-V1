const fs = require('fs');
const DB_PATH = './lib/db.json';

let data = {
  banned: [],
  antilink: {},   // groupId -> { mode: 'off'|'delete'|'kick'|'warn', warns: {jid:count} }
  settings: {}    // place for more settings later
};

if (fs.existsSync(DB_PATH)) {
  try { data = JSON.parse(fs.readFileSync(DB_PATH)); } catch(e){ console.error('DB load error', e); }
}

function save() { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

module.exports = {
  data,
  save
};