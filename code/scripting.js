// This file is where all the code that you can run on each frame happens
// use shaderUtils for stuff like runShader(image, func)

// shaderUtils is also, utils for shaders (uv getting etc.)
// etc

// Shaders are just fancy functions btw
const Jimp = require("jimp");
const shaderUtils = require("./utils/shaderUtils.js");
const videoSettings = require("../videoSettings.json");
const prototypes = require("./prototypes.js");


// this is before the directories are made 
async function onRenderingPrepStart(songInfo = prototypes.songInfoPrototype.prototype) {

}

// this is after the directories are made but before any rendering happens
async function onRenderingPrepDone(songInfo = prototypes.songInfoPrototype.prototype) {

}

// this is just before the makeFrame function is called
async function onRenderingBaseFrameStart(time = Number.prototype, frame = Number.prototype) {

}

// this is just after the makeFrame function is called
// this is also before the emojis are rendered
async function onRenderedBaseFrame(baseFrame = Jimp.prototype, time = Number.prototype, frame = Number.prototype) {

}

// this is for specific effects on the eomji only
async function onRenderedEmojis(emojiFrame = Jimp.prototype, time = Number.prototype, frame = Number.prototype) {

}

// this is before the text is rendered, your chance here for certain effects to happen only to the text
// you can also change the songinfo thing here if you wish
// outputShadersOnText should be an array of shader functions
async function onRenderingPrepText(songInfo = prototypes.songInfoPrototype.prototype, outputShadersOnText = Array.prototype, 
                                   time = Number.prototype, frame = Number.prototype) {
    outputShadersOnText.push(chromaticAbberation);
}

async function chromaticAbberation(i = prototypes.inPrototype, o = prototypes.outPrototype) {
    let r = shaderUtils.getPixelFromUV([i.uv[0] + 0.003, i.uv[1]], i.baseImage, true);
    let b = shaderUtils.getPixelFromUV([i.uv[0] - 0.003, i.uv[1]], i.baseImage, true);

    o.r = r.r;
    o.g = i.g;
    o.b = b.b;
    o.a = (i.a + r.a + b.a) / 3;
}

// your last chance to make any changes before the image is saved
async function onFullRenderedImage(finalImage = Jimp.prototype, time = Number.prototype, frame = Number.prototype) {

}


module.exports = { 
    onRenderingPrepStart, onRenderingPrepDone, 
    onRenderingBaseFrameStart, onRenderedBaseFrame,
    onRenderingPrepText, onFullRenderedImage,
    onRenderedEmojis
};