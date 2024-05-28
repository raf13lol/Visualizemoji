const Jimp = require("jimp");
const { emojiPrototype, songInfoPrototype, midiNoteDataStuffPrototype } = require("../prototypes.js");
const videoSettings = require("../../videoSettings.json");
const emojiInfo = require("./emojiData.json");
const { clamp } = require("../utils/utils.js");

let midiStuffs = {startingMpb: Number.prototype,
    startingTimeSign: Array.prototype,

    mpbChanges: Array.prototype,
    timeSignChanges: Array.prototype,
    
    noteData: Array.prototype};
let setMidiStuffs = (val) => midiStuffs = val;

let emojiImages = [ emojiPrototype ];
emojiImages = [];

async function createTheEmojiPrototypes(emojisUsed = Array.prototype) {
    let emojiWidth  = videoSettings.width  * videoSettings.emojiScaleToScreen;
    let emojiHeight = videoSettings.height * videoSettings.emojiScaleToScreen;
    let spacing = [emojiWidth * 0.05, emojiHeight * 0.05];
    let emojiCountPerRow = Math.max(1, videoSettings.width / (emojiWidth + spacing[0]) );

    for (let i = 0; i < emojisUsed.length; i++) {
        let emojiId = emojisUsed[i].split("-")[0];

        let image = await Jimp.read(`temp/${emojiInfo.emojiIds[emojiId]}.png`);
        let emojiData = {...emojiPrototype};

        emojiData.image = image;
        emojiData.startingAlpha = 0; // actually...
        emojiData.scale = 1;
        emojiData.angle = 0;
        emojiData.lastNoteIndex = 0;
        emojiData.imageName = emojiId;
        emojiData.trackName = midiStuffs.noteData[i][0];
        emojiData.trackId = midiStuffs.noteData[i][2];
        emojiData.position = [emojiWidth * (i % emojiCountPerRow) + spacing[0], 
                              videoSettings.height - ((emojiHeight + spacing[1]) * (Math.floor(i / emojiCountPerRow) + 1) + spacing[1])];
        emojiData.movementOffset = [0, 0];

        emojiImages.push(emojiData);
    }

    console.log("Done! Rendering should start.");
}

function trackFlagCheck(trackName = String.prototype, flag = String.prototype) {
    return trackName.toUpperCase().split("-").includes(flag.toUpperCase());
}

function arrayRemoveIndex(array = Array.prototype, index = Number.prototype) {
    return array.filter((e, i) => index != i)
}

async function doTheStuffingsWithTheEmojiImageExclaimationMarkHere(time = Number.prototype, songInfo = songInfoPrototype) {
    // bpm *
    for (let i = 0; i < midiStuffs.mpbChanges.length; i++) {
        let mpbChange = midiStuffs.mpbChanges[i];
        if (time >= mpbChange[1]) {
            songInfo.bpm = 60 / (mpbChange[0] / 1000000);
            midiStuffs.mpbChanges = arrayRemoveIndex(midiStuffs.mpbChanges, i);
            i--; // step back one
        }
        else
            break;
    }
    // time sign
    for (let i = 0; i < midiStuffs.timeSignChanges.length; i++) {
        let timeSignChange = midiStuffs.timeSignChanges[i];
        if (time >= timeSignChange[2]) {
            songInfo.timeSign = timeSignChange[0] + "/" + timeSignChange[1];
            midiStuffs.timeSignChanges = arrayRemoveIndex(midiStuffs.timeSignChanges, i);
            i--; // step back one
        }
        else
            break;
    }
    // notes
    for (let i = 0; i < midiStuffs.noteData.length; i++) {
        let track = midiStuffs.noteData[i];
        let trackName = track[0];

        let emojiThing = emojiImages.find((val) => val.trackId == track[2]) || emojiImages[0];

        for (let j = emojiThing.lastNoteIndex; j < track[1].length; j++) {
            let note = {...midiNoteDataStuffPrototype}; // my darn intellisenser
            note = track[1][j];

            if (time >= note.secondsStart) {
                // listen i need to do this, i'm sorry
                /// Rotation
                if (trackFlagCheck(trackName, "RA"))
                    emojiThing.angle = (emojiThing.angle + 90) % 360; // this is antiClockwise
                else if (trackFlagCheck(trackName, "R"))
                    emojiThing.angle = (emojiThing.angle + 270) % 360; // i would rather keep these numbers positive
                else if (trackFlagCheck(trackName, "RR"))
                    emojiThing.angle = Math.floor(Math.random() * 4) * 90; // simple...
                else if (trackFlagCheck(trackName, "RRNR")) // uhh
                {
                    let oldAngle = emojiThing.angle;
                    while (emojiThing.angle == oldAngle)
                        emojiThing.angle = Math.floor(Math.random() * 4) * 90; 
                }

                // Transform
                if (trackFlagCheck(trackName, "P"))
                    emojiThing.scale = 1.025;
                if (trackFlagCheck(trackName, "V"))
                    emojiThing.startingAlpha = note.velocity / 100;
                else
                    emojiThing.startingAlpha = 1;
                if (trackFlagCheck(trackName, "M"))
                {
                    // let's do this in pixels because.... i'm too lazy until this breaks
                    let dir = Math.floor(Math.random() * 4);
                    switch (dir)
                    {
                        case 0: emojiThing.movementOffset = [0, -8]; break;
                        case 1: emojiThing.movementOffset = [8,  0]; break;
                        case 2: emojiThing.movementOffset = [0,  8]; break;
                        case 3: emojiThing.movementOffset = [-8, 0]; break;
                    }
                }
                // movement wrong, leaving this if people want it
                else if (trackFlagCheck(trackName, "MW"))
                {
                    // let's do this in pixels because.... i'm too lazy until this breaks
                    emojiThing.movementOffset = [8 * Math.floor(Math.random() * 3) - 1, 8 * Math.floor(Math.random() * 3) - 1];
                    while (Math.abs(emojiThing.movementOffset[0]) + Math.abs(emojiThing.movementOffset[1]) == 0)
                        emojiThing.movementOffset = [8 * Math.floor(Math.random() * 3) - 1, 8 * Math.floor(Math.random() * 3) - 1];
                }

                emojiThing.noteStart = note.secondsStart;
                emojiThing.noteEnd = note.secondsEnd;
                if (trackFlagCheck(trackName, "S"))
                    emojiThing.noteEnd += note.secondsEnd - note.secondsStart;

                // this should stop issues...?
                emojiThing.lastNoteIndex = j;
            }
            else
                break;
        }
    }
}

// i recommend `https://easings.net`

// circOut
function emojiAlphaEase(x = Number.prototype) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

// circOut
function emojiScaleEase(x = Number.prototype) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

// circOut
function emojiMoveEase(x = Number.prototype) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}


// why do i have to make a promise?
///! "... makeFrame is not a function" ok how about this then?
function makeFrame(isText = false) {
    return new Promise(async (resolve, reject) => {

        let func = (image = Jimp.prototype) => {
            if (image.bitmap.width != videoSettings.width || image.bitmap.height != videoSettings.height)
                image.resize(videoSettings.width, videoSettings.height);

            resolve(image);
        };

        if (videoSettings.bgImageUsage && !isText)
            func(await Jimp.read(videoSettings.bgVariable));
        else
            new Jimp(videoSettings.width, videoSettings.height, isText ? 0x00000000 : videoSettings.bgVariable, (err, image) => func(image));

    });
}

// So then, let's do this
// Returns emojiFrame
async function renderEmojis(time = Number.prototype, songInfo = songInfoPrototype) {
    doTheStuffingsWithTheEmojiImageExclaimationMarkHere(time, songInfo);
    let emojiFrame = Jimp.prototype; 
    emojiFrame = await makeFrame(true); // reuse this

    for (let emojiI = 0; emojiI < emojiImages.length; emojiI++)
    {
        let emojiImageData = emojiImages[emojiI];
        if (time > emojiImageData.noteEnd + 0.025) // add a bit of time for an extra frame or so just in case
            continue; // it's done

        // do alpha check here to not waste processing power
        let progress = clamp((time - emojiImageData.noteStart) / (emojiImageData.noteEnd - emojiImageData.noteStart));
        if (isNaN(progress))
            progress = 1;
        if (trackFlagCheck(emojiImageData.trackName, "I"))
            progress = Math.floor(progress);

        // easing shit for alpha
        let newAlpha = emojiImageData.startingAlpha - emojiImageData.startingAlpha * emojiAlphaEase(progress);
        // console.log(`a: ${newAlpha}  p: ${progress}   sta:${emojiImageData.noteStart} end: ${emojiImageData.noteEnd}  time: ${time}`);
        if (newAlpha <= 0.0)
            continue;

        let emojiImage = await emojiImageData.image.cloneQuiet();

        // simple
        if (emojiImageData.angle != 0)
            emojiImage = emojiImage.rotate(emojiImageData.angle);
        if (newAlpha != 1.0)
            emojiImage = emojiImage.opacity(newAlpha);

        let beatProgress = clamp((time - emojiImageData.noteStart) / (1 / (60 / songInfo.bpm) ));
        let scale = emojiImageData.scale - (emojiImageData.scale - 1) * emojiScaleEase(beatProgress);

        if (scale != 1)
            emojiImage.scale(scale);

        let movementsOffsets = [...emojiImageData.movementOffset];
        movementsOffsets[0] *= 1 - emojiMoveEase(beatProgress);
        movementsOffsets[1] *= 1 - emojiMoveEase(beatProgress);

        emojiFrame.composite(emojiImage, emojiImageData.position[0] + movementsOffsets[0], emojiImageData.position[1] + movementsOffsets[1]);
    }
    
    return emojiFrame;
}

module.exports = { setMidiStuffs, emojiImages, createTheEmojiPrototypes, renderEmojis }