const convertoror = require("convert-svg-to-png"); // 🧑🙅🧑🙅🧑🙅🧑🙅
const videoSettings = require("../../videoSettings.json");
const fs = require("fs");

const doingEmojiStuff = fs.existsSync(videoSettings.infoMidi) && videoSettings.useEmojis;

async function doAllThePrepping() {
    if (!doingEmojiStuff)
        return;
}

module.exports = { doingEmojiStuff };