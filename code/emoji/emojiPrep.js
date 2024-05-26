const convertoror = require("convert-svg-to-png"); // 🧑🙅🧑🙅🧑🙅🧑🙅
const videoSettings = require("../../videoSettings.json");
const fs = require("fs");
const { makeDir } = require("../utils/utils.js");
const { parseMidiToArray } = require("./midiParser.js");

const doingEmojiStuff = fs.existsSync(videoSettings.infoMidi) && videoSettings.useEmojis;

async function doAllThePrepping() {
    if (!doingEmojiStuff)
        return;

    makeDir("temp");

    let data = await parseMidiToArray(videoSettings.infoMidi);

    //console.log(data); //? :grni: YAY!
}

module.exports = { doingEmojiStuff, doAllThePrepping };