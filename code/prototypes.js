const Jimp = require("jimp");

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
    artist: String.prototype, songName: String.prototype
};

// emoji/midi stuff

// this is for emojis so just like timing is needed (for now)
const midiNoteDataStuffPrototype = {
    deltaTicksStart: Number.prototype, secondsStart: Number.prototype,
    deltaTicksEnd: Number.prototype, secondsEnd: Number.prototype,
    ////noteNumber: Number.prototype //*? uhm please fact check me on this
    //? gitignore ^^, i found a method that doesnt impose on this work
}

module.exports = { inPrototype, outPrototype, songInfoPrototype, midiNoteDataStuffPrototype };