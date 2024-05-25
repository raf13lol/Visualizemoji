// This file handles rendering the frames and the calls to "scripting.js"

const Jimp = require("jimp");
const videoSettings = require("../videoSettings.json");
const { exec } = require("node:child_process");

const scripting = require("./scripting.js");
const prototypes = require("./prototypes.js");
const { runShader } = require("./utils/shaderUtils.js");
const { secondsToNiceFancyText, makeDir } = require("./utils/utils.js");



// why do i have to make a promise?
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

let time = 0.0;
let frameNumber = 0;

const cloneImage = (image = Jimp.prototype) => {
    return new Promise(async (resolve, reject) => {
        new Jimp({ data: image.bitmap.data, width: image.bitmap.width, height: image.bitmap.height }, (err, newImg) => {
            resolve(newImg);
        });
    });
}

const renderFrameCount = async (songInfo = prototypes.songInfoPrototype.prototype, countOfFrames = Number.prototype) => {
    const songinfo = songInfo;

    await scripting.onRenderingPrepStart();

    console.log(`Begin rendering ${countOfFrames} frames`)
    makeDir("output");
    makeDir("output/rendering");

    await scripting.onRenderingPrepDone();

    let font = await Jimp.loadFont(`assets/font/${videoSettings.fontName}${videoSettings.fontSize}${videoSettings.blackFont ? "black" : "white"}.fnt`);
    time = 0.0;

    let baseFrame = Jimp.prototype;
    baseFrame = await makeFrame();

    let start = Date.now();
    let anyText = (videoSettings.displayBPMStuff || videoSettings.displaySongPosition || videoSettings.displaySongStuff)

    for (let i = 0; i < countOfFrames; i++) {
        frameNumber = i;

        await scripting.onRenderingBaseFrameStart(time, i);
        let frame = Jimp.prototype; 
        frame = await cloneImage(baseFrame);

        await scripting.onRenderedBaseFrame(frame, time, i);
        
        if (anyText) {

            let shadersToRunOnText = [];
            await scripting.onRenderingPrepText(songinfo, shadersToRunOnText);

            let textFrame = Jimp.prototype; 
            textFrame = await makeFrame(true);

            let yPos = videoSettings.fontVerticalSpace;

            if (videoSettings.displaySongStuff) {
                textFrame.print(font, 4, yPos, `${videoSettings.songName} by ${videoSettings.artist}`);
                yPos += videoSettings.fontSize + videoSettings.fontVerticalSpace;
            }
            
            if (videoSettings.displaySongPosition) {
                textFrame.print(font, 4, yPos, `${secondsToNiceFancyText(time)}/${secondsToNiceFancyText(videoSettings.songDuration)}`);
                yPos += videoSettings.fontSize + videoSettings.fontVerticalSpace;
            }

            if (videoSettings.displayBPMStuff) {
                textFrame.print(font, 4, yPos, `BPM: ${videoSettings.bpm}`);
                yPos += videoSettings.fontSize + videoSettings.fontVerticalSpace;
                textFrame.print(font, 4, yPos, `${videoSettings.timeSign}`);

            }
            
            for (let i = 0; i < shadersToRunOnText.length; i++) {
                await runShader(textFrame, shadersToRunOnText[i]);
            }

            frame.composite(textFrame, 0, 0);
        }
        
        await scripting.onFullRenderedImage(frame, time, i);
        frame.write(`output/rendering/frame${i}.png`);

        time += 1 / videoSettings.frameRate;

        console.log(`Rendered ${i}/${countOfFrames} (${Math.floor(i / countOfFrames * 100)}% - ${secondsToNiceFancyText(time)} - took ${Math.floor((Date.now() - start) / 1000)}s)`)
    }

    console.log(`Utilize FFMPEG to combine the frames together`)

    // -y is needed!
    exec(`ffmpeg -framerate ${videoSettings.frameRate} -i output/rendering/frame%d.png -c:v libx264 -r ${videoSettings.frameRate} -pix_fmt yuv420p -y output/output.mp4`, 
    (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(stdout);
    });
}


module.exports = { renderFrameCount, time, frameNumber };