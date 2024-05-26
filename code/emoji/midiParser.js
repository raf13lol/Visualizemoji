const midifile = require("midi-file");
const fs = require("fs");
const { midiNoteDataStuffPrototype } = require("../prototypes");

// header is all it needs but while looking at it i got really distracted
// midi files are quite interesting and i think i should maybe make my own in something silly (e.g zap)
const baseMidi = [...stringToArrayCode("MThd")]

function stringToArrayCode(str = String.prototype) {
    let arr = [];
    for (let i = 0; i < str.length; i++)
        arr.push(str.charCodeAt(i));
    return arr;
}

async function parseMidiToArray(midiFileName = String.prototype) {
    let data = [ [ "", [midiNoteDataStuffPrototype] ] ]; // arrays of [names of track, [array of midiNoteDataStuffPrototype]]
    data = [];

    let file = fs.readFileSync(midiFileName);
    
    let midi = midifile.parseMidi(baseMidi);

    try {
        midi = midifile.parseMidi(file);
    }
    catch (e) {
        e = 0;
        console.log("Error whilst parsing midi file, are you sure you put a midi file?");
        process.exit(0);
    }
    
    const ticksPerBeat = midi.header.ticksPerBeat;

    let MPB = NaN;
    let MPBchanges = [[0, 0]]; //? mpb, dt
    MPBchanges = [];
    
    //? default values for a simple 4/4 monye beat
    let timeSign = [4,4];
    timeSign = undefined;
    let timeSignChanges = [[4,4,0]]; //? num, den, dt
    timeSignChanges = [];
    
    for (let trackIndex = 0; trackIndex < midi.header.numTracks; trackIndex++) {
        let curTrack = midi.tracks[trackIndex];

        let trackName = "";
        let notes = [midiNoteDataStuffPrototype];
        notes = [];

        let timePassedTicks = 0;

        let noteEventsToFinish = [];
        ////let noteEventID = 0;
        for (let eventIndex = 0; eventIndex < curTrack.length; eventIndex++) {
            let curEvent = curTrack[eventIndex];
            let note = {...midiNoteDataStuffPrototype};
            
            timePassedTicks += curEvent.deltaTime;

            switch (curEvent.type) {
                case "timeSignature": timeSign == undefined ? timeSign = [curEvent.numerator, curEvent.denominator] : timeSignChanges.push([curEvent.numerator, curEvent.denominator, timePassedTicks]); break;
                case "setTempo": isNaN(MPB) ? MPB = curEvent.microsecondsPerBeat : MPBchanges.push([curEvent.microsecondsPerBeat, timePassedTicks]); break;
                case "trackName": trackName = curEvent.text; break;
                case "noteOn":
                    //? hey graphman maybe we could use velocity for emoji opacity?
                    // flag only
                    note.deltaTicksStart = timePassedTicks; // i meant for this in an absolute value, deltaTime isn't absolute
                    note.secondsStart = doMpbStuffings(timePassedTicks, MPB, MPBchanges, ticksPerBeat); //? time in seconds (wouldnt it be better to store in microseconds everything? for accuracy)
                                                // maybe milliseconds, microseconds could perhaps maybe not likely cause floating point imprecision
                    ////noteEventsToFinish.push([note, noteEventID++]); //? note event to search later in noteOff; yes i know that midi doesnt
                    ////ignore this i went a bit insane
                    //? nvm we need some kind of ID and note number it is
                    noteEventsToFinish.push([note, curEvent.noteNumber]);
                    break;
                case "noteOff":
                    let fuckercfucker = false;
                    for (let i = 0; i < noteEventsToFinish.length; i++) {
                        if (noteEventsToFinish[i][1] == curEvent.noteNumber) {
                            note = noteEventsToFinish[i][0];
                            noteEventsToFinish.pop();
                            fuckercfucker = true;
                            break;
                        }
                    }
                    if (!fuckercfucker) {
                        console.log("What the hell? Deep fried pizza? No, kid. No-no-no-no- oh my god, young man... KILL YOURSELF!");
                        process.exit(1);
                        //! Young man! (you're gonna) Kill yourself!
                    }
                    //let tempdt = curEvent.deltaTime + timePassedTicks;
                    //seconds = doMpbStuffings(curEvent, MPB, MPBchanges, ticksPerBeat);
                    note.deltaTicksEnd = timePassedTicks; // i meant for this in an absolute value, deltaTime isn't absolute
                    note.secondsEnd = doMpbStuffings(timePassedTicks, MPB, MPBchanges, ticksPerBeat);
                    notes.push(note);
                    break;
            }
        }
        if (trackName == "" || notes.length <= 0)
            continue; //! asd
            //? meanman.
        data.push([trackName, notes]); //? yay!
    }

    let returningMPBchanges = [...MPBchanges];
    let returningTimeSignChanges = [...timeSignChanges];

    for (let i = 0; i < returningMPBchanges.length; i++) {
        returningMPBchanges[i][1] = doMpbStuffings(returningMPBchanges[i][1], MPB, MPBchanges, ticksPerBeat);
    }

    for (let i = 0; i < returningTimeSignChanges.length; i++) {
        returningTimeSignChanges[i][1] = doMpbStuffings(returningTimeSignChanges[i][1], MPB, MPBchanges, ticksPerBeat);
    }

    return {
        startingMpb: MPB,
        startingTimeSign: timeSign,

        mpbChanges: returningMPBchanges,
        timeSignChanges: returningTimeSignChanges,
        
        noteData: data
    };
    //? graphman, how do you wanna go about returning the mpb? i suggest this but feel free to change
    //? unless we dont need it, idk
    // mpb is just for our seconds/milliseconds/idfkseconds
    // returning it isn't what i had in mind
}

function doMpbStuffings(deltaTime, MPB, mpbList, ticksPerBeat) {
    if (mpbList.length <= 0) {
        return (deltaTime/ticksPerBeat) * MPB / 1000000;
    }
    let seconds = (mpbList[0][1]/ticksPerBeat) * (MPB / 1000000);
    for (let MPBchange = 0; MPBchange < mpbList.length; MPBchange++) {
        /*
        ? writing plan in plain english to actually understand what im doing
        ? 1. if the current note's DT is greater than or equal to the MPB change's DT (aka hasnt reached note yet):
        ? 2. remove the MPB change's DT by the previous MPB change's DT (if = 0, start MPB's DT (aka 0)) and set it to DTdiff
        ? 2.5. if the note's DT is smaller than the next MPB change's DT or song End, use this instead of the current MPB change DT
        ? 3. calculate time in seconds of DTdiff with the previous MPB change (if = 0, start MPB)
        ? 4. continue for all MPB changes before reaching the current note's DT
        */
        if (deltaTime >= mpbList[MPBchange][1]) {
            //tempdt -= MPBchanges[MPBchange][1];
            seconds += (mpbList[MPBchange][1]/ticksPerBeat) * ((MPBchange == 0 ? MPB : mpbList[MPBchange-1][0]) / 1000000);
        } else {
            seconds += (deltaTime/ticksPerBeat) * ((MPBchange == 0 ? MPB : mpbList[MPBchange-1][0]) / 1000000);
            break;
        }
    }
    return seconds;
}

module.exports = { parseMidiToArray }