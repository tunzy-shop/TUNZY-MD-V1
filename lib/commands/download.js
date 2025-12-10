const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../../config.js');
const Downloader = require('../../utils/downloader.js');

module.exports = {
    // Download TikTok video
    async tiktok(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide TikTok URL\nExample: .tiktok https://vm.tiktok.com/xxxx"
            });
            return;
        }
        
        const url = args[0];
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📥 Downloading TikTok video...\n⏳ Please wait..."
        });
        
        try {
            const videoPath = await Downloader.downloadTikTok(url);
            
            if (fs.existsSync(videoPath)) {
                const fileSize = fs.statSync(videoPath).size / (1024 * 1024);
                
                if (fileSize > config.downloads.maxSize) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `❌ File too large (${fileSize.toFixed(2)}MB). Max: ${config.downloads.maxSize}MB`
                    });
                    fs.unlinkSync(videoPath);
                    return;
                }
                
                await sock.sendMessage(msg.key.remoteJid, {
                    video: fs.readFileSync(videoPath),
                    caption: `🎬 *TikTok Video*\n\n📌 Downloaded via TUNZY MD V1\n🔗 ${url}`
                });
                
                fs.unlinkSync(videoPath);
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: "❌ Failed to download TikTok video"
                });
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Download Instagram
    async instagram(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide Instagram URL\nExample: .instagram https://instagram.com/p/xxxx"
            });
            return;
        }
        
        const url = args[0];
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📸 Downloading Instagram media...\n⏳ Please wait..."
        });
        
        try {
            // Try to download using yt-dlp
            const filename = path.join('./tmp', `instagram_${Date.now()}.mp4`);
            
            await new Promise((resolve, reject) => {
                exec(`yt-dlp -f "best" -o "${filename}" "${url}"`, async (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    if (fs.existsSync(filename)) {
                        const fileSize = fs.statSync(filename).size / (1024 * 1024);
                        
                        if (fileSize > config.downloads.maxSize) {
                            await sock.sendMessage(msg.key.remoteJid, {
                                text: `❌ File too large (${fileSize.toFixed(2)}MB). Max: ${config.downloads.maxSize}MB`
                            });
                            fs.unlinkSync(filename);
                            return;
                        }
                        
                        await sock.sendMessage(msg.key.remoteJid, {
                            video: fs.readFileSync(filename),
                            caption: `📸 *Instagram Video*\n\n📌 Downloaded via TUNZY MD V1\n🔗 ${url}`
                        });
                        
                        fs.unlinkSync(filename);
                    }
                    resolve();
                });
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}\n\nTry: .igs for Instagram stories`
            });
        }
    },
    
    // Instagram stories
    async igs(sock, msg, args) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📱 Instagram stories download coming soon..."
        });
    },
    
    // Download Facebook
    async facebook(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide Facebook URL\nExample: .facebook https://fb.watch/xxxx"
            });
            return;
        }
        
        const url = args[0];
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📹 Downloading Facebook video...\n⏳ Please wait..."
        });
        
        try {
            const filename = path.join('./tmp', `facebook_${Date.now()}.mp4`);
            
            await new Promise((resolve, reject) => {
                exec(`yt-dlp -f "best[height<=720]" -o "${filename}" "${url}"`, async (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    if (fs.existsSync(filename)) {
                        await sock.sendMessage(msg.key.remoteJid, {
                            video: fs.readFileSync(filename),
                            caption: `📹 *Facebook Video*\n\n📌 Downloaded via TUNZY MD V1\n🔗 ${url}`
                        });
                        
                        fs.unlinkSync(filename);
                    }
                    resolve();
                });
            });
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Download song
    async song(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide song name\nExample: .song amazing grace"
            });
            return;
        }
        
        const query = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎵 Searching for: ${query}\n⏳ Please wait...`
        });
        
        try {
            const audioPath = await Downloader.downloadAudio(query);
            
            if (fs.existsSync(audioPath)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mp4',
                    caption: `🎶 *${query}*\n\n📌 Downloaded via TUNZY MD V1`
                });
                
                fs.unlinkSync(audioPath);
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    },
    
    // Play (same as song)
    async play(sock, msg, args) {
        await this.song(sock, msg, args);
    },
    
    // Spotify
    async spotify(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide song name\nExample: .spotify shape of you"
            });
            return;
        }
        
        const query = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎵 Searching Spotify for: ${query}\n⏳ Please wait...`
        });
        
        // Use YouTube as fallback for Spotify
        await this.song(sock, msg, args);
    },
    
    // Video downloader
    async video(sock, msg, args) {
        if (!args.length) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: "❌ Please provide URL or search query\nExample: .video https://youtube.com/watch?v=xxxx"
            });
            return;
        }
        
        const query = args.join(' ');
        await sock.sendMessage(msg.key.remoteJid, {
            text: "📥 Downloading video...\n⏳ Please wait..."
        });
        
        try {
            const videoPath = await Downloader.downloadVideo(query);
            
            if (fs.existsSync(videoPath)) {
                const fileSize = fs.statSync(videoPath).size / (1024 * 1024);
                
                if (fileSize > config.downloads.maxSize) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `❌ File too large (${fileSize.toFixed(2)}MB). Max: ${config.downloads.maxSize}MB`
                    });
                    fs.unlinkSync(videoPath);
                    return;
                }
                
                await sock.sendMessage(msg.key.remoteJid, {
                    video: fs.readFileSync(videoPath),
                    caption: `📹 *Video*\n\n📌 Downloaded via TUNZY MD V1\n🔗 ${query}`
                });
                
                fs.unlinkSync(videoPath);
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ Error: ${error.message}`
            });
        }
    }
};
