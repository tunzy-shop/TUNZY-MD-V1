const { data, save } = require('./database');

function getGroupAnti(groupId) {
  if (!data.antilink[groupId]) data.antilink[groupId] = { mode: 'off', warns: {} };
  return data.antilink[groupId];
}

function setAntiMode(groupId, mode) {
  const g = getGroupAnti(groupId);
  g.mode = mode;
  if (mode !== 'warn') g.warns = {};
  save();
}

function warnUser(groupId, jid) {
  const g = getGroupAnti(groupId);
  g.warns[jid] = (g.warns[jid] || 0) + 1;
  save();
  return g.warns[jid];
}

function clearWarns(groupId, jid) {
  const g = getGroupAnti(groupId);
  delete g.warns[jid];
  save();
}

module.exports = { getGroupAnti, setAntiMode, warnUser, clearWarns };