const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config.js');
const Watermark = require('./watermark.js');

class Downloader {
    constructor() {
        this.watermark = new Watermark();
    }
    
    // Download TikTok video without API
    async downloadTikTok(url) {
        try {
            console.log(`📥 Downloading TikTok: ${url}`);
            
            // Use free TikTok downloader service
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data && response.data.data) {
                const videoUrl = response.data.data.play;
                const videoBuffer = await this.downloadFile(videoUrl);
                
                // Add watermark
                if (config.downloads.watermarkAllMedia) {
                    const watermarkedPath = await this.watermark.addToVideoBuffer(videoBuffer, 'tiktok');
                    return watermarkedPath;
                }
                
                return this.saveBuffer(videoBuffer, 'tiktok.mp4');
            }
            
            throw new Error('No video data found');
        } catch (error) {
            console.error('TikTok download error:', error.message);
            
            // Alternative method using yt-dlp
            return await this.downloadWithYtdlp(url, 'tiktok');
        }
    }
    
    // Download Instagram video/photo
    async downloadInstagram(url) {
        try {
            console.log(`📥 Downloading Instagram: ${url}`);
            
            // Use free Instagram downloader
            const apiUrl = `https://instagram-scraper-api2.p.rapidapi.com/v1/media_info?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'x-rapidapi-key': 'your-rapidapi-key', // Free key from rapidapi.com
                    'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
                }
            });
            
            if (response.data && response.data.items) {
                const media = response.data.items[0];
                let mediaUrl;
                
                if (media.video_versions) {
                    // Video
                    mediaUrl = media.video_versions[0].url;
                    const videoBuffer = await this.downloadFile(mediaUrl);
                    
                    if (config.downloads.watermarkAllMedia) {
                        return await this.watermark.addToVideoBuffer(videoBuffer, 'instagram');
                    }
                    
                    return this.saveBuffer(videoBuffer, 'instagram.mp4');
                } else if (media.image_versions2) {
                    // Image
                    mediaUrl = media.image_versions2.candidates[0].url;
                    const imageBuffer = await this.downloadFile(mediaUrl);
                    
                    if (config.downloads.watermarkAllMedia) {
                        return await this.watermark.addToImageBuffer(imageBuffer, 'instagram');
                    }
                    
                    return this.saveBuffer(imageBuffer, 'instagram.jpg');
                }
            }
            
            throw new Error('No media found');
        } catch (error) {
            console.error('Instagram download error:', error.message);
            return await this.downloadWithYtdlp(url, 'instagram');
        }
    }
    
    // Download Facebook video
    async downloadFacebook(url) {
        try {
            console.log(`📥 Downloading Facebook: ${url}`);
            return await this.downloadWithYtdlp(url, 'facebook');
        } catch (error) {
            console.error('Facebook download error:', error.message);
            throw error;
        }
    }
    
    // Download YouTube video/shorts
    async downloadYouTube(url) {
        try {
            console.log(`📥 Downloading YouTube: ${url}`);
            return await this.downloadWithYtdlp(url, 'youtube');
        } catch (error) {
            console.error('YouTube download error:', error.message);
            throw error;
        }
    }
    
    // Universal downloader using yt-dlp (NO API NEEDED)
    async downloadWithYtdlp(url, platform) {
        return new Promise((resolve, reject) => {
            const filename = path.join('./tmp', `${platform}_${Date.now()}.mp4`);
            
            // Install yt-dlp first: pip install yt-dlp
            const command = `yt-dlp -f "best[height<=720]" -o "${filename}" "${url}"`;
            
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`yt-dlp error: ${error.message}`);
                    reject(error);
                    return;
                }
                
                console.log(`✅ Downloaded: ${filename}`);
                
                // Add watermark
                if (config.downloads.watermarkAllMedia && fs.existsSync(filename)) {
                    try {
                        const watermarkedPath = await this.watermark.addToVideo(filename, `${platform}_watermarked.mp4`);
                        resolve(watermarkedPath);
                    } catch (watermarkError) {
                        console.error('Watermark error:', watermarkError.message);
                        resolve(filename); // Return original if watermark fails
                    }
                } else {
                    resolve(filename);
                }
            });
        });
    }
    
    // Simple file download
    async downloadFile(url) {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        
        return Buffer.from(response.data);
    }
    
    // Save buffer to file
    saveBuffer(buffer, filename) {
        const filepath = path.join('./tmp', `${Date.now()}_${filename}`);
        fs.writeFileSync(filepath, buffer);
        return filepath;
    }
    
    // Check file size
    getFileSize(filepath) {
        const stats = fs.statSync(filepath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        return fileSizeInMB;
    }
    
    // Clean old files
    cleanOldFiles(maxAge = 3600000) { // 1 hour
        const tmpDir = './tmp';
        if (!fs.existsSync(tmpDir)) return;
        
        const files = fs.readdirSync(tmpDir);
        const now = Date.now();
        
        files.forEach(file => {
            const filepath = path.join(tmpDir, file);
            const stats = fs.statSync(filepath);
            const fileAge = now - stats.mtimeMs;
            
            if (fileAge > maxAge) {
                fs.unlinkSync(filepath);
                console.log(`🗑️  Cleaned: ${file}`);
            }
        });
    }
}

module.exports = new Downloader();
