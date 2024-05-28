const { createConverter } = require('convert-svg-to-png'); // 🧑🙅🧑🙅🧑🙅🧑🙅
const videoSettings = require("../../videoSettings.json");
const emojiInfo = require("./emojiData.json");
const fs = require("fs");
const { makeDir } = require("../utils/utils.js");
const { parseMidiToArray } = require("./midiParser.js");
const { setMidiStuffs, createTheEmojiPrototypes } = require('./emojiScripting.js');
const { songInfoPrototype } = require('../prototypes.js');

const doingEmojiStuff = fs.existsSync(videoSettings.infoMidi) && videoSettings.useEmojis;

async function doAllThePrepping(songInfo = songInfoPrototype) {
    if (!doingEmojiStuff)
        return;

    makeDir("temp");

    console.log("Understanding the MIDI...");

    let data = await parseMidiToArray(videoSettings.infoMidi);
    songInfo.bpm = 60 / (data.startingMpb / 1000000);
    songInfo.timeSign = data.startingTimeSign[0] + "/" + data.startingTimeSign[1];

    //console.log(data); //? :grni: YAY
    //? wat is map 
    // not fulling sure what i'm doing either but trust me
    //? lmfao ok
    let usedEmojis = data.noteData.map(val => val[0]); // this worked, Yay! (luckyness)
    
    let w = videoSettings.width * videoSettings.emojiScaleToScreen;
    let h = videoSettings.height * videoSettings.emojiScaleToScreen;
    
    console.log("Getting the emoji images ready...");

    // hold on //? yes, yes, the magical yus, consult the documentation, nu!
    let converotro = createConverter(); // says about creating convertors to optimize //? ok
    // sample code from npm package page
    try {
        for (const emojiId of usedEmojis) {
            let id = Number(emojiId.split("-")[0]);

            let path = "temp/" + emojiInfo.emojiIds[id] + ".png";
            if (fs.existsSync(path))
                continue;
            await converotro.convertFile("assets/emojis/svg/" + emojiInfo.emojiIds[id] + ".svg", {
                outputFilePath: path,
                width: w,
                height: h
            });
        }
    } 
    catch (e) {
        console.log("Something went wrong when converting the emoji SVGs to PNGs. Are you sure you've defined all of the emoji ids used in the MIDI file?");
        process.exit(1);
    }
    finally {
        await converotro.destroy();
    }

    // now that's done... i think prep's done?
    setMidiStuffs(data);

    console.log("Preparing them for use...");

    await createTheEmojiPrototypes(usedEmojis);
}

module.exports = { doingEmojiStuff, doAllThePrepping };