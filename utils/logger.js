const fs = require('fs');
const path = require('path');
const config = require('../config.js');

class Logger {
    constructor() {
        this.logDir = './logs';
        this.ensureLogDir();
    }
    
    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    getLogFile() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `${date}.log`);
    }
    
    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        
        console.log(logMessage);
        
        // Write to file
        fs.appendFileSync(this.getLogFile(), logMessage + '\n');
    }
    
    info(message) {
        this.log(message, 'INFO');
    }
    
    error(message) {
        this.log(message, 'ERROR');
    }
    
    warn(message) {
        this.log(message, 'WARN');
    }
    
    debug(message) {
        if (process.env.DEBUG === 'true') {
            this.log(message, 'DEBUG');
        }
    }
    
    // Log command usage
    logCommand(user, command, args = []) {
        const logMessage = `Command: ${command} | User: ${user} | Args: ${args.join(' ')}`;
        this.info(logMessage);
    }
    
    // Log auto-join events
    logAutoJoin(channel, status) {
        const logMessage = `Auto-Join: ${channel} - ${status}`;
        this.info(logMessage);
    }
}

module.exports = new Logger();