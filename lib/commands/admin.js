module.exports = {
    // Ban user
    async ban(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user or reply to their message\nExample: .ban @user"
            });
            return;
        }
        
        try {
            const participant = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [participant], 'remove');
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ User ${participant.split('@')[0]} has been banned from the group`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Promote user
    async promote(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .promote @user"
            });
            return;
        }
        
        try {
            const participant = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [participant], 'promote');
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `👑 ${participant.split('@')[0]} has been promoted to admin`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Demote user
    async demote(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .demote @user"
            });
            return;
        }
        
        try {
            const participant = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [participant], 'demote');
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📉 ${participant.split('@')[0]} has been demoted from admin`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Mute group
    async mute(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
            await sock.sendMessage(msg.key.remoteJid, {
                text: "🔇 Group has been muted\nOnly admins can send messages"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Unmute group
    async unmute(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
            await sock.sendMessage(msg.key.remoteJid, {
                text: "🔊 Group has been unmuted\nEveryone can send messages"
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Delete message
    async del(sock, msg, args) {
        if (!msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please reply to a message to delete"
            });
            return;
        }
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                delete: {
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.key.participant,
                    remoteJid: msg.key.remoteJid,
                    fromMe: false
                }
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Kick user
    async kick(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .kick @user"
            });
            return;
        }
        
        try {
            const participant = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [participant], 'remove');
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `👢 ${participant.split('@')[0]} has been kicked from the group`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Warn user
    async warn(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please mention a user\nExample: .warn @user"
            });
            return;
        }
        
        const participant = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ *Warning Issued*\n\n` +
                  `*To:* ${participant.split('@')[0]}\n` +
                  `*Reason:* ${reason}\n` +
                  `*By:* ${msg.key.participant?.split('@')[0] || 'Admin'}\n\n` +
                  `Further violations may result in a ban.`
        });
    },
    
    // Clear chat
    async clear(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🧹 Chat clearing feature would be implemented here\n(This is a simulation)"
        });
    },
    
    // Tag all
    async tagall(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants;
            
            let mentionText = '📢 *Attention All Members!*\n\n';
            participants.forEach((participant, index) => {
                mentionText += `@${participant.id.split('@')[0]} `;
                if ((index + 1) % 5 === 0) mentionText += '\n';
            });
            
            const message = args.length ? args.join(' ') + '\n\n' + mentionText : mentionText;
            
            const mentions = participants.map(p => p.id);
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: message,
                mentions: mentions
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Hide tag
    async hidetag(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        const text = args.join(' ') || '📢 Silent Announcement';
        
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants.map(p => p.id);
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: text,
                mentions: participants
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Set group description
    async setgdesc(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a description\nExample: .setgdesc This is our group"
            });
            return;
        }
        
        const description = args.join(' ');
        try {
            await sock.groupUpdateDescription(msg.key.remoteJid, description);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ Group description updated:\n${description}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Set group name
    async setgname(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide a new name\nExample: .setgname New Group Name"
            });
            return;
        }
        
        const name = args.join(' ');
        try {
            await sock.groupUpdateSubject(msg.key.remoteJid, name);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ Group name changed to: ${name}`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Accept all requests
    async accept(sock, msg, args) {
        if (args[0] === 'all') {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "✅ All pending group requests would be accepted here\n(This is a simulation)"
            });
        }
    },
    
    // Anti-link toggle
    async antilink(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🔗 Anti-link feature would be toggled here\n(This is a simulation)"
        });
    },
    
    // Anti-badword toggle
    async antibadword(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "🚫 Anti-badword feature would be toggled here\n(This is a simulation)"
        });
    },
    
    // Tag non-admins
    async tagnotadmin(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const nonAdmins = metadata.participants.filter(p => !p.admin);
            
            if (nonAdmins.length === 0) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "👑 Everyone in this group is an admin!"
                });
                return;
            }
            
            let mentionText = '📢 *Attention Non-Admins!*\n\n';
            nonAdmins.forEach((participant, index) => {
                mentionText += `@${participant.id.split('@')[0]} `;
                if ((index + 1) % 5 === 0) mentionText += '\n';
            });
            
            const message = args.length ? args.join(' ') + '\n\n' + mentionText : mentionText;
            const mentions = nonAdmins.map(p => p.id);
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: message,
                mentions: mentions
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Reset group link
    async resetlink(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        try {
            const code = await sock.groupInviteCode(msg.key.remoteJid);
            const link = `https://chat.whatsapp.com/${code}`;
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🔗 *New Group Link*\n\n${link}\n\nShare this link to invite people to the group.`
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Welcome toggle
    async welcome(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "👋 Welcome message feature would be toggled here\n(This is a simulation)"
        });
    },
    
    // Goodbye toggle
    async goodbye(sock, msg, args) {
        if (!msg.key.remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ This command only works in groups"
            });
            return;
        }
        
        await sock.sendMessage(msg.key.remoteJid, {
            text: "👋 Goodbye message feature would be toggled here\n(This is a simulation)"
        });
    }
};
