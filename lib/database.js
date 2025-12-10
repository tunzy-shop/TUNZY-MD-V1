const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.dataDir = './data';
        this.ensureDataDir();
        this.data = {};
        this.loadData();
    }
    
    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    
    loadData() {
        const files = fs.readdirSync(this.dataDir);
        
        files.forEach(file => {
            if (file.endsWith('.json')) {
                const key = file.replace('.json', '');
                try {
                    const content = fs.readFileSync(path.join(this.dataDir, file), 'utf8');
                    this.data[key] = JSON.parse(content);
                } catch (error) {
                    this.data[key] = {};
                }
            }
        });
    }
    
    saveData(key) {
        const filepath = path.join(this.dataDir, `${key}.json`);
        fs.writeFileSync(filepath, JSON.stringify(this.data[key] || {}, null, 2));
    }
    
    // User data management
    getUser(userId) {
        if (!this.data.users) this.data.users = {};
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                id: userId,
                commandsUsed: 0,
                warnings: 0,
                joinedAt: Date.now(),
                lastSeen: Date.now()
            };
        }
        return this.data.users[userId];
    }
    
    updateUser(userId, data) {
        const user = this.getUser(userId);
        Object.assign(user, data);
        this.saveData('users');
        return user;
    }
    
    incrementCommand(userId) {
        const user = this.getUser(userId);
        user.commandsUsed = (user.commandsUsed || 0) + 1;
        user.lastSeen = Date.now();
        this.saveData('users');
    }
    
    // Group data management
    getGroup(groupId) {
        if (!this.data.groups) this.data.groups = {};
        if (!this.data.groups[groupId]) {
            this.data.groups[groupId] = {
                id: groupId,
                settings: {
                    welcome: true,
                    goodbye: true,
                    antilink: false,
                    antibadword: false,
                    antitag: false,
                    chatbot: false
                },
                warns: {},
                createdAt: Date.now()
            };
        }
        return this.data.groups[groupId];
    }
    
    updateGroup(groupId, data) {
        const group = this.getGroup(groupId);
        Object.assign(group, data);
        this.saveData('groups');
        return group;
    }
    
    // Settings management
    getSettings() {
        if (!this.data.settings) {
            this.data.settings = {
                bot: {
                    mode: 'public',
                    prefix: '.',
                    autoJoin: true,
                    autoRead: false
                },
                owner: {
                    number: '2349067345425',
                    name: 'Tunzy'
                }
            };
        }
        return this.data.settings;
    }
    
    updateSettings(data) {
        const settings = this.getSettings();
        Object.assign(settings, data);
        this.saveData('settings');
        return settings;
    }
    
    // Auto-join tracking
    getAutoJoinStatus() {
        if (!this.data.autojoin) {
            this.data.autojoin = {
                whatsappGroup: false,
                whatsappChannel: false,
                lastJoinAttempt: 0
            };
        }
        return this.data.autojoin;
    }
    
    setAutoJoinStatus(service, status) {
        const autojoin = this.getAutoJoinStatus();
        autojoin[service] = status;
        autojoin.lastJoinAttempt = Date.now();
        this.saveData('autojoin');
    }
    
    // Statistics
    getStats() {
        if (!this.data.stats) {
            this.data.stats = {
                totalCommands: 0,
                totalUsers: 0,
                totalGroups: 0,
                uptime: 0,
                startTime: Date.now()
            };
        }
        return this.data.stats;
    }
    
    incrementCommandCount() {
        const stats = this.getStats();
        stats.totalCommands++;
        this.saveData('stats');
    }
    
    // Clear data
    clearData(key) {
        if (this.data[key]) {
            delete this.data[key];
            const filepath = path.join(this.dataDir, `${key}.json`);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
    }
    
    // Backup data
    backup() {
        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(this.data, null, 2));
        return backupPath;
    }
}

module.exports = new Database();