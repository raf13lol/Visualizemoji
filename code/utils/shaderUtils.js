const Jimp = require("jimp");
const { clamp } = require("./utils.js");
const prototypes = require("../prototypes.js");

// gets the pixel index for image.bitmap.data[INDEX]
// the return is from the actual code of jimp
// completelySafe should only be for really big needed optimzations
const getPixelIndex = (image = Jimp.prototype | Number.prototype, x = Number.prototype, y = Number.prototype, wrap = true, completelySafe = false) => {
    if (completelySafe) // image is a number here
        return image * y + x << 2;

    if (wrap) {
        while (x > image.bitmap.width - 1)
            x -= image.bitmap.width;
        while (x < 0)
            x += image.bitmap.width;

        while (y > image.bitmap.height - 1)
            y -= image.bitmap.height;
        while (y < 0)
            y += image.bitmap.height;
    }

    else {
        x = clamp(x, 0, image.bitmap.width - 1)
        y = clamp(y, 0, image.bitmap.height - 1)
    }

    return image.bitmap.width * y + x << 2;
}

// uv = [x, y]
// uhh idk for the 3rd arg, ceil seems a bit silly
// returns {r: pixR, g: pixG, b: pixB, a: pixA}
const getPixelFromUV = (uv = Array.prototype, image = Jimp.prototype, wrap = false, useRoundInsteadOfFloorForDecimalPixels = false) => {

    let baseX = uv[0] * (image.bitmap.width - 1);
    let x = useRoundInsteadOfFloorForDecimalPixels ? Math.round(baseX) : Math.floor(baseX);

    let baseY = uv[1] * (image.bitmap.height - 1);
    let y = useRoundInsteadOfFloorForDecimalPixels ? Math.round(baseY) : Math.floor(baseY);

    let pixelIndex = getPixelIndex(image, x, y, wrap);

    return {r: image.bitmap.data[pixelIndex], 
            g: image.bitmap.data[pixelIndex + 1], 
            b: image.bitmap.data[pixelIndex + 2], 
            a: image.bitmap.data[pixelIndex + 3]};
}

// idk specific cases
const rgbaObjectToArray4 = (rgbaObject = Object.prototype) => {
    return [rgbaObject.r, rgbaObject.g, rgbaObject.b, rgbaObject.a];
}

const runShader = async (image = Jimp.prototype, shaderFunc) => {
    const { timeArray } = require("../frameRendering.js");

    let originalImage = image.cloneQuiet();

    for (let y = 0; y < image.bitmap.height; y++)
        for (let x = 0; x < image.bitmap.width; x++)
        {
            let idx = getPixelIndex(image.bitmap.width, x, y, false, true);
        
            let inProto = prototypes.inPrototype;

            inProto.r = image.bitmap.data[idx];
            inProto.g = image.bitmap.data[idx + 1];
            inProto.b = image.bitmap.data[idx + 2];
            inProto.a = image.bitmap.data[idx + 3];

            inProto.uv = [x / (image.bitmap.width - 1), y / (image.bitmap.height - 1)];
            inProto.pixelPos = [x, y];

            inProto.time = timeArray[0];
            inProto.frame = timeArray[1];

            inProto.image = originalImage;
            inProto.alteredImage = image;

            let outProto = {r: inProto.r, g: inProto.g, b: inProto.b, a: inProto.a};

            await shaderFunc(inProto, outProto);

            image.bitmap.data[idx] = outProto.r;
            image.bitmap.data[idx + 1] = outProto.g;
            image.bitmap.data[idx + 2] = outProto.b;
            image.bitmap.data[idx + 3] = outProto.a;
        }
};

module.exports = { getPixelIndex, getPixelFromUV, rgbaObjectToArray4,
    runShader
};