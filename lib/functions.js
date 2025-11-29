const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

//─────────────────────────────────────────────
// DOWNLOAD VIDEO / AUDIO + ADD WATERMARK
//─────────────────────────────────────────────
async function downloadMedia(url, outputPath) {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(outputPath));
        writer.on("error", reject);
    });
}

//─────────────────────────────────────────────
// ADD WATERMARK TO VIDEO
//─────────────────────────────────────────────
function addWatermark(videoPath, watermarkPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .input(watermarkPath)
            .complexFilter([
                {
                    filter: "overlay",
                    options: { x: "10", y: "10" }, // watermark top-left corner
                },
            ])
            .outputOptions("-c:a copy")
            .save(outputPath)
            .on("end", () => resolve(outputPath))
            .on("error", (err) => reject(err));
    });
}

//─────────────────────────────────────────────
// PLAY SONG (MP3) + WATERMARK NOTICE
//─────────────────────────────────────────────
async function playSong(url, watermarkImage) {
    const tempFile = path.join(__dirname, "../tmp/song.mp4");
    const watermarkedFile = path.join(__dirname, "../tmp/song_wm.mp4");
    await downloadMedia(url, tempFile);
    await addWatermark(tempFile, watermarkImage, watermarkedFile);
    return watermarkedFile;
}

//─────────────────────────────────────────────
// TIKTOK VIDEO DOWNLOAD + WATERMARK
//─────────────────────────────────────────────
async function downloadTikTok(url, watermarkImage) {
    const tempFile = path.join(__dirname, "../tmp/tiktok.mp4");
    const watermarkedFile = path.join(__dirname, "../tmp/tiktok_wm.mp4");
    // Use some TikTok downloader API or direct link
    await downloadMedia(url, tempFile);
    await addWatermark(tempFile, watermarkImage, watermarkedFile);
    return watermarkedFile;
}

//─────────────────────────────────────────────
// REPLY TO MEDIA (VV / HD) + WATERMARK
//─────────────────────────────────────────────
async function replyWithWatermark(mediaBuffer, watermarkPath, outputPath) {
    const tempFile = path.join(__dirname, "../tmp/reply.mp4");
    const watermarkedFile = outputPath || path.join(__dirname, "../tmp/reply_wm.mp4");

    fs.writeFileSync(tempFile, mediaBuffer);
    await addWatermark(tempFile, watermarkPath, watermarkedFile);
    return watermarkedFile;
}

module.exports = {
    downloadMedia,
    addWatermark,
    playSong,
    downloadTikTok,
    replyWithWatermark,
};