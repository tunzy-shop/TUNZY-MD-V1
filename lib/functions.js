const fs = require('fs');
const path = require('path');

module.exports = {
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Send menu text with image
    sendMenu: async (sock, jid, name, menuPic, ownerNumber, channelLink, groupLink, BOT_NAME) => {
        await sock.sendMessage(jid, {
            image: fs.readFileSync(menuPic),
            caption:
`Wassup ${name} 👋

♣ PUBLIC COMMANDS
.ping
.menu
.play <song>
.repo
.owner
.tiktok <link>
.save
.hd
.hd2
.vv
.vv2

♣ ADMIN COMMANDS
.add
.kick
.tag
.hidetag
.tagall
.accept all
.antilink
.open
.close
.promote
.demote

♣ OWNER COMMANDS
.restart
.ban
.unban
.block
.anticall
.mode

♣ GROUP COMMANDS
.gc link
.list admin
.list online

Owner: TUNZY (+${ownerNumber})
Channel: ${channelLink}
Group: ${groupLink}

Powered by: ${BOT_NAME}`
        });
    },

    // Simple watermark for videos
    addWatermark: async (inputFile, outputFile, watermarkText) => {
        const ffmpeg = require('fluent-ffmpeg');
        return new Promise((resolve, reject) => {
            ffmpeg(inputFile)
            .outputOptions([
                `-vf drawtext=text='${watermarkText}':x=10:y=H-th-10:fontsize=24:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2`
            ])
            .save(outputFile)
            .on('end', resolve)
            .on('error', reject);
        });
    },

    readJSON: (file) => {
        if (!fs.existsSync(file)) return {};
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    },

    writeJSON: (file, data) => {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
}