const fs = require("node:fs");

const makeDir = (dirname) => {
    if (!fs.existsSync(dirname))
        fs.mkdirSync(dirname);
    else {
        fs.rmSync(dirname, {recursive: true, force: true});
        makeDir(dirname);
    }
}


// clamp well, clamps a value between min and max
const clamp = (value, min = 0, max = 1) => {
    return Math.max(min, Math.min(max, value));
}

// why is there hour support you may ask?
// why not?
const secondsToNiceFancyText = (seconds) => {
    seconds = Math.floor(seconds);

    let returningText = "";

    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    let hours = Math.floor(minutes / 60);
    minutes %= 60;

    let minutesString = `${minutes}`;

    if (hours > 0)
    {
        returningText += `${hours}:`;
        if (minutesString.length < 2)
            minutesString = `0${minutes}`;
    }

    let secondsString = `${seconds}`;
    if (secondsString.length < 2)
        secondsString = `0${seconds}`;

    returningText += `${minutesString}:${secondsString}`;

    return returningText;
}

module.exports = { makeDir, clamp, secondsToNiceFancyText };