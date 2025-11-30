const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const sharp = require('sharp')
const { writeExifImg, writeExifVid } = require('node-webpmux')

async function imageToWebp(input) {
    const output = path.join(__dirname, '../tmp', 'sticker.webp')
    await sharp(input).webp().toFile(output)
    return output
}

async function videoToWebp(input) {
    const output = path.join(__dirname, '../tmp', 'sticker.webp')
    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${input}" -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 "${output}"`, (err) => {
            if (err) reject(err)
            else resolve()
        })
    })
    return output
}

module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid }
