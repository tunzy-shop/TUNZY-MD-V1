const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

class Watermark {
    constructor() {
        this.watermarkText = config.watermark.text;
        this.watermarkImage = config.watermarkImage;
    }
    
    // Add watermark to image
    async addToImage(imagePath, outputPath) {
        try {
            // Check if watermark image exists
            if (fs.existsSync(this.watermarkImage)) {
                await this.addImageWatermark(imagePath, outputPath);
            } else {
                await this.addTextWatermark(imagePath, outputPath);
            }
            return true;
        } catch (error) {
            console.error('Watermark error:', error);
            return false;
        }
    }
    
    // Add image watermark
    async addImageWatermark(inputPath, outputPath) {
        const watermark = await sharp(this.watermarkImage)
            .resize(100, 100)
            .composite([{
                input: this.watermarkImage,
                gravity: config.watermark.position === 'bottom-right' ? 'southeast' : 'northeast',
                blend: 'over'
            }])
            .toBuffer();
            
        await sharp(inputPath)
            .composite([{
                input: watermark,
                gravity: config.watermark.position === 'bottom-right' ? 'southeast' : 'northeast',
                blend: 'over'
            }])
            .toFile(outputPath);
    }
    
    // Add text watermark
    async addTextWatermark(inputPath, outputPath) {
        const svgText = `
            <svg width="400" height="100">
                <style>
                    .text { 
                        fill: ${config.watermark.color};
                        font-size: ${config.watermark.fontSize}px;
                        font-family: Arial, sans-serif;
                        font-weight: bold;
                        opacity: ${config.watermark.opacity};
                    }
                </style>
                <text x="10" y="30" class="text">${this.watermarkText}</text>
            </svg>
        `;
        
        const svgBuffer = Buffer.from(svgText);
        
        await sharp(inputPath)
            .composite([{
                input: svgBuffer,
                gravity: config.watermark.position === 'bottom-right' ? 'southeast' : 'northeast',
                blend: 'over'
            }])
            .toFile(outputPath);
    }
    
    // Create watermarked text message
    createWatermarkedText(text) {
        if (!config.watermark.enabled) return text;
        
        const watermark = `\n\n━━━━━━━━━━━━━━━━━━━━\n${this.watermarkText}\n━━━━━━━━━━━━━━━━━━━━`;
        return text + watermark;
    }
    
    // Check if file exists
    fileExists(filepath) {
        return fs.existsSync(filepath);
    }
}

module.exports = new Watermark();