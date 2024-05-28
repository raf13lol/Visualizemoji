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

function arrayRemoveIndex(array = Array.prototype, index = Number.prototype) {
    return array.filter((e, i) => index != i)
}

async function parseMidiToArray(midiFileName = String.prototype) {
    let data = [ [ "", [midiNoteDataStuffPrototype], 0 ] ]; // arrays of [names of track, [array of midiNoteDataStuffPrototype], trackIndex]
    data = [];

    let file = fs.readFileSync(midiFileName);
    
    let midi = midifile.parseMidi(baseMidi);

    try {
        midi = midifile.parseMidi(file);
    }
    catch (e) {
        console.log("Error whilst parsing midi file, are you sure you put a midi file? Error = " + e);
        e = 0;
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

                case "timeSignature": 
                    if (timeSign == undefined)  
                        timeSign = [curEvent.numerator, curEvent.denominator]; 
                    else 
                        timeSignChanges.push([curEvent.numerator, curEvent.denominator, timePassedTicks]); 
                    break;
                case "setTempo": 
                    if (isNaN(MPB))
                        MPB = curEvent.microsecondsPerBeat;
                    else 
                        MPBchanges.push([curEvent.microsecondsPerBeat, timePassedTicks]); 
                    break;
                case "trackName": trackName = curEvent.text; break;
                case "noteOn":
                    //? hey graphman maybe we could use velocity for emoji opacity?
                    // flag only
                    note.deltaTicksStart = timePassedTicks; // i meant for this in an absolute value, deltaTime isn't absolute
                    note.secondsStart = doMpbStuffings(timePassedTicks, MPB, MPBchanges, ticksPerBeat); //? time in seconds (wouldnt it be better to store in microseconds everything? for accuracy)
                    note.velocity = curEvent.velocity; 
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
                            noteEventsToFinish = arrayRemoveIndex(noteEventsToFinish, i);
                            i--;
                            fuckercfucker = true;
                            break;
                        }
                    }
                    if (!fuckercfucker) {
                        console.log(`noteOff event found with no corresponding noteOn event prior. Something may be wrong with the MIDI file or the code.`);
                        process.exit(1);
                        //// Young man! (you're gonna) Kill yourself!
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
        // push trackIndex for ids and stuff!
        data.push([trackName, notes, trackIndex]); //? yay!
    }

    let returningMPBchanges = [];
    let returningTimeSignChanges = [...timeSignChanges];

    for (let i = 0; i < MPBchanges.length; i++) {
        // shallow copying isn't working? the fuck?
        returningMPBchanges.push([MPBchanges[i][0]]);

        returningMPBchanges[i][1] = doMpbStuffings(MPBchanges[i][1], MPB, MPBchanges, ticksPerBeat, i > 2);
    }

    for (let i = 0; i < returningTimeSignChanges.length; i++) {
        returningTimeSignChanges[i][2] = doMpbStuffings(returningTimeSignChanges[i][2], MPB, MPBchanges, ticksPerBeat);
    }

    return {
        startingMpb: MPB,
        startingTimeSign: timeSign,

        mpbChanges: returningMPBchanges,
        timeSignChanges: returningTimeSignChanges,
        
        noteData: data
    };
}

function doMpbStuffings(deltaTime, MPB, mpbList, ticksPerBeat, debug = false) {
    if (mpbList.length <= 0) {
        return (deltaTime/ticksPerBeat) * MPB / 1000000;
    }
    let seconds = 0;
    let previousDelta = 0;
    let changedDelta = deltaTime;
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

            let change = (mpbList[MPBchange][1] - previousDelta);

            seconds += (change/ticksPerBeat) * ((MPBchange == 0 ? MPB : mpbList[MPBchange-1][0]) / 1000000);
            changedDelta -= change;
            previousDelta = mpbList[MPBchange][1];
        } else {
            seconds += (changedDelta/ticksPerBeat) * ((MPBchange == 0 ? MPB : mpbList[MPBchange-1][0]) / 1000000);
            break;
        }
    }
    return seconds;
}

module.exports = { parseMidiToArray }