// This file is where the code to render the frames and any other admin stuff here
const frameRendering = require("./frameRendering.js");
const videoSettings = require("../videoSettings.json");
const emojiPrep = require("../code/emoji/emojiPrep.js");

if (videoSettings.height % 2 == 1)
{
    console.log("Sorry but height must be a multiple of 2");
    return;
}

emojiPrep.doAllThePrepping().then(() => {
    // frameRendering.renderFrameCount({ 
    //     bpm: videoSettings.bpm, timeSign: videoSettings.timeSign,
    //     artist: videoSettings.artist, songName: videoSettings.songName}, videoSettings.frameRate * videoSettings.songDuration + Math.floor(videoSettings.frameRate / 6));
});

