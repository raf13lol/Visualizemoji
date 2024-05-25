const Jimp = require("jimp");

// shader prototypes
const inPrototype = {
    r: Number.prototype, g: Number.prototype, b: Number.prototype, a: Number.prototype,
    uv: Array.prototype, pixelPos: Array.prototype, 
    // ^
    // uv is the [0-1, 0-1] thing from shaders, i will make it work like how it does on 
    // shadertoy dw (higher = higher uv.y)
    
    time: Number.prototype, frame: Number.prototype,

    image: Jimp.prototype, // image so you can get other pixels
    alteredImage: Jimp.prototype 
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

module.exports = { inPrototype, outPrototype, songInfoPrototype };