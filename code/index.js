// This file is where the code to render the frames and any other admin stuff here
const frameRendering = require("./frameRendering.js");
const videoSettings = require("../videoSettings.json");
const emojiPrep = require("../code/emoji/emojiPrep.js");
const { renderEmojis } = require("./emoji/emojiScripting.js");

if (videoSettings.height % 2 == 1)
{
    console.log("Sorry but height must be a multiple of 2");
    return;
}

let data = { bpm: videoSettings.bpm, timeSign: videoSettings.timeSign,
     artist: videoSettings.artist, songName: videoSettings.songName,
     songDuration: videoSettings.songDuration}
     
emojiPrep.doAllThePrepping(data).then(() => {
    frameRendering.renderFrameCount(data, videoSettings.frameRate * videoSettings.songDuration + Math.floor(videoSettings.frameRate / 6));1
});

