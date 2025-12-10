const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

class Watermark {
    constructor() {
        this.watermarkText = config.watermark.text;
        this.ensureTmpDir();
    }
    
    ensureTmpDir() {
        const dir = './tmp';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    // Add watermark to image (for photos)
    async addToImage(inputPath, outputPath = null) {
        try {
            if (!config.watermark.enabled) return inputPath;
            
            const output = outputPath || path.join('./tmp', `watermarked_${Date.now()}.jpg`);
            
            const metadata = await sharp(inputPath).metadata();
            const fontSize = Math.min(metadata.width, metadata.height) * 0.04;
            
            // Create watermark SVG
            const svg = this.createWatermarkSVG(
                this.watermarkText,
                fontSize,
                metadata.width,
                metadata.height
            );
            
            await sharp(inputPath)
                .composite([{
                    input: Buffer.from(svg),
                    gravity: config.watermark.position || 'southeast'
                }])
                .jpeg({ quality: 90 })
                .toFile(output);
            
            console.log(`✅ Watermark added to image: ${output}`);
            return output;
        } catch (error) {
            console.error('Image watermark error:', error.message);
            return inputPath;
        }
    }
    
    // Add watermark to image from buffer
    async addToImageBuffer(buffer, platform) {
        try {
            if (!config.watermark.enabled) return buffer;
            
            const outputPath = path.join('./tmp', `${platform}_${Date.now()}.jpg`);
            fs.writeFileSync(outputPath, buffer);
            
            const watermarkedPath = await this.addToImage(outputPath);
            return fs.readFileSync(watermarkedPath);
        } catch (error) {
            console.error('Buffer watermark error:', error);
            return buffer;
        }
    }
    
    // Simple text overlay for videos (alternative method)
    async addTextToVideo(inputPath, outputPath) {
        try {
            if (!config.watermark.enabled) return inputPath;
            
            // For now, we'll create an image with text and suggest using video editing
            // In production, you might want to use a simple video processing library
            console.log(`📝 Adding text to video: ${inputPath}`);
            
            // Create a simple text image
            const textImage = path.join('./tmp', `text_${Date.now()}.png`);
            await this.createTextImage(this.watermarkText, textImage);
            
            // Note: For actual video watermarking, you'd need FFmpeg
            // This is a simplified version
            console.log('⚠️ Video watermarking requires FFmpeg installation');
            console.log('📌 Install FFmpeg: sudo apt install ffmpeg (Linux) or download from ffmpeg.org');
            
            return inputPath;
        } catch (error) {
            console.error('Video text error:', error);
            return inputPath;
        }
    }
    
    // Create watermark SVG
    createWatermarkSVG(text, fontSize, imageWidth, imageHeight) {
        const padding = config.watermark.padding || 20;
        const bgColor = config.watermark.backgroundColor || 'rgba(0,0,0,0.5)';
        const textColor = config.watermark.fontColor || '#FFFFFF';
        
        // Calculate text dimensions
        const textLength = text.length;
        const estimatedWidth = textLength * (fontSize * 0.6);
        const estimatedHeight = fontSize * 1.5;
        
        // Position
        let x, y;
        switch(config.watermark.position) {
            case 'top-left':
                x = padding;
                y = padding + estimatedHeight;
                break;
            case 'top-right':
                x = imageWidth - estimatedWidth - padding;
                y = padding + estimatedHeight;
                break;
            case 'bottom-left':
                x = padding;
                y = imageHeight - padding;
                break;
            case 'center':
                x = (imageWidth - estimatedWidth) / 2;
                y = (imageHeight - estimatedHeight) / 2;
                break;
            case 'bottom-right':
            default:
                x = imageWidth - estimatedWidth - padding;
                y = imageHeight - padding;
        }
        
        return `
            <svg width="${imageWidth}" height="${imageHeight}">
                <defs>
                    <filter id="shadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
                    </filter>
                </defs>
                <rect x="${x - 10}" y="${y - estimatedHeight + 10}" 
                      width="${estimatedWidth + 20}" height="${estimatedHeight}" 
                      fill="${bgColor}" rx="5" ry="5" opacity="${config.watermark.opacity || 0.8}"/>
                <text x="${x}" y="${y}" 
                      font-size="${fontSize}"
                      font-family="Arial, sans-serif"
                      font-weight="bold"
                      fill="${textColor}"
                      filter="url(#shadow)">
                    ${text}
                </text>
            </svg>
        `;
    }
    
    // Create simple text image
    async createTextImage(text, outputPath) {
        const svg = `
            <svg width="400" height="100">
                <rect width="400" height="100" fill="rgba(0,0,0,0.7)" rx="10" ry="10"/>
                <text x="50%" y="50%" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      font-size="40"
                      font-family="Arial"
                      font-weight="bold"
                      fill="white">
                    ${text}
                </text>
            </svg>
        `;
        
        await sharp(Buffer.from(svg))
            .png()
            .toFile(outputPath);
        
        return outputPath;
    }
    
    // Simple video processing with text overlay (requires ffmpeg)
    async simpleVideoWatermark(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            
            // Create text image
            const textImage = path.join('./tmp', `watermark_${Date.now()}.png`);
            
            this.createTextImage(this.watermarkText, textImage)
                .then(() => {
                    // FFmpeg command to overlay text
                    const cmd = `ffmpeg -i "${inputPath}" -i "${textImage}" ` +
                               `-filter_complex "overlay=W-w-20:H-h-20" ` +
                               `-codec:a copy "${outputPath}"`;
                    
                    exec(cmd, (error) => {
                        // Clean up
                        if (fs.existsSync(textImage)) {
                            fs.unlinkSync(textImage);
                        }
                        
                        if (error) {
                            console.error('FFmpeg error:', error.message);
                            reject(error);
                        } else {
                            console.log(`✅ Video watermarked: ${outputPath}`);
                            resolve(outputPath);
                        }
                    });
                })
                .catch(reject);
        });
    }
}

module.exports = Watermark;
