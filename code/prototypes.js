const Jimp = require("jimp");

//? Reinventing TypeScript because we're just like that.

// shader prototypes
const inPrototype = {
    r: Number.prototype, g: Number.prototype, b: Number.prototype, a: Number.prototype,
    uv: Array.prototype, pixelPos: Array.prototype, 
    // ^
    // uv is the [0-1, 0-1] thing from shaders, i will make it work like how it does on 
    // shadertoy dw (higher = higher uv.y)
    
    shaderOrder: Number.prototype, // index of what shader it is
    time: Number.prototype, frame: Number.prototype,

    image: Jimp.prototype, // image so you can get other pixels
    baseImage: Jimp.prototype // image before all the shaders got it 🤤🤤🤤🤤
    // ^
    // if you really want to get the pixels 
    // from the image you are altering with the shader, you can
};

const outPrototype = {
    r: Number.prototype, g: Number.prototype, b: Number.prototype, a: Number.prototype
};

// song info
const songInfoPrototype = {
    bpm: Number.prototype, timeSign: String.prototype, 
    artist: String.prototype, songName: String.prototype,
    songDuration: Number.prototype
};

// emoji/midi stuff

// this is for emojis so just like timing is needed (for now)
const midiNoteDataStuffPrototype = {
    deltaTicksStart: Number.prototype, secondsStart: Number.prototype,
    deltaTicksEnd: Number.prototype, secondsEnd: Number.prototype,
    velocity: Number.prototype // blauweman wanted a velocity alpha thing soooo
    ////noteNumber: Number.prototype //*? uhm please fact check me on this
    //? gitignore ^^, i found a method that doesnt impose on this work
}

// emoji prototype..
const emojiPrototype = {
    image: Jimp.prototype, 
    startingAlpha: Number.prototype, scale: Number.prototype, position: Array.prototype, angle: Number.prototype,
    movementOffset: Array.prototype,
    imageName: String.prototype, // identification?
    trackName: String.prototype, trackId: Number.prototype, // all of the flags
    // there (seconds)
    noteStart: Number.prototype, noteEnd: Number.prototype, lastNoteIndex: Number.prototype
}

module.exports = { inPrototype, outPrototype, songInfoPrototype, midiNoteDataStuffPrototype, emojiPrototype };