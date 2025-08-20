import { MidiParser } from './midi-parser-js/src/midi-parser.js'

let normalizeKey = function(key) {
    const baseLow = 48;   // C3
    const baseHigh = 72;  // C5
    let note = key;
    while (note < baseLow) note += 12;
    while (note > baseHigh) note -= 12;
    note = Math.min(baseHigh, Math.max(baseLow, note));
    return (note - baseLow) / (baseHigh - baseLow);
}

let withinMargin = function(value, target, margin) {
  return Math.abs(value - target) <= margin;
}

let secondsANDTicks = function(durationInSeconds) {
  if (durationInSeconds < 0) {
    durationInSeconds = 0;
  }
  
  const totalSeconds = Math.floor(durationInSeconds);
  let fraction = Math.abs(durationInSeconds - totalSeconds);

  let ticks = Math.max(0, Math.round(fraction * 40)-1);

  if (ticks === 40) {
    return { seconds: totalSeconds + 1, ticks: 0 };
  }

  const seconds = Math.abs(totalSeconds);

  return { seconds, ticks };
}

let autoTotebot = function(name) {
    let bot = 3;
    let mode = 1;
    if(name.toLowerCase().includes("drum")) {bot = 4; mode = 2;}
    if(name.toLowerCase().includes("bass")) {bot = 2; mode = 2;}
    if(name.toLowerCase().includes("saw")) {bot = 3; mode = 2;}
    if(name.toLowerCase().includes("sine")) {bot = 3; mode = 2;}
    if(name.toLowerCase().includes("jazz")) {bot = 2; mode = 1;}
    if(name.toLowerCase().includes("harp")) {bot = 2; mode = 2;}
    if(name.toLowerCase().includes("guitar")) {bot = 2; mode = 2;}
    if(name.toLowerCase().includes("gtr")) {bot = 2; mode = 2;}
    if(name.toLowerCase().includes("harpsichord")) {bot = 1; mode = 1;}
    if(name.toLowerCase().includes("trombone")) {bot = 2; mode = 1;}
    if(name.toLowerCase().includes("lead")) {bot = 1; mode = 2;}
    return [bot, mode];
}

let bakeBlueprint = function() {
    let IDs = [0,1,2,3,4,5,6];
    let temptracks = [];
    config.tracks.forEach((k, v) => {
        if (k.Volume > 0) {
        let durations = [];
        let notes = [];
        let totebotTones = [];
        k.NoteEvents.forEach((i, p) => {
            let newdur = true;
            let durationInQuestion = 0;
            let newtone = true;
            let toneInQuestion = 0;
            totebotTones.forEach((m, n) => {
                if (m.tone === i.tone) {
                    newtone = false;
                    toneInQuestion = n;
                }
            });
            if (newtone === true) {
                let ID = IDs[IDs.length-1]+1;
                IDs.push(ID);
                totebotTones.push({tone : i.tone, id : ID, type : k.Totebot, mode : k.Mode, vol : k.Volume});
                toneInQuestion = totebotTones.length-1;
            }
            durations.forEach((m, n) => {
                if (withinMargin(m.duration, i.duration, 0.005) && m.tone === totebotTones[toneInQuestion].id) {
                    newdur = false;
                    durationInQuestion = n;
                }
            });
            if (newdur === true) {
                let ID = IDs[IDs.length-1]+1;
                IDs.push(ID);
                let exID = IDs[IDs.length-1]+1;
                IDs.push(exID);
                durations.push({duration : i.duration, tone : totebotTones[toneInQuestion].id, extraid : exID, id : ID});
                durationInQuestion = durations.length-1;
            }
            let delta = i.timeSinceLast;
            notes.push({durlink : durations[durationInQuestion].id, delta : delta});
        });
        temptracks.push({durs : durations, notes : notes, tones : totebotTones});
        }
    });
    let tempBake = {notes : [], durs : [], tones : []}
    let tempnotes = []
    temptracks.forEach((k, v) => {
        let absolutTime = 0;
        k.notes.forEach((i, p) => {
            absolutTime += i.delta;
            tempnotes.push({time : absolutTime, durlink : i.durlink, delta : i.delta});
        });
        k.tones.forEach((i, p) => {
            tempBake.tones.push(i)
        });
        k.durs.forEach((i, p) => {
            tempBake.durs.push(i)
        });
    });
    while (tempnotes.length > 0) {
    let earliestNote = {time : Infinity, durlink : 0, delta : 0}; 
    let earliestNoteInd = 0;
    tempnotes.forEach((k, v) => {
        if (k.time < earliestNote.time) {
            earliestNote = {time : k.time, durlink : k.durlink, delta : k.delta};
            earliestNoteInd = v;
        }
    });
    tempBake.notes.push(earliestNote);
    tempnotes.splice(earliestNoteInd, 1);
    }
    tempBake.notes.forEach((k, v) => {
        if (v === 0) {
            k.delta = k.time;
        } else {
            k.delta = k.time - tempBake.notes[v-1].time;
        }
    });
    let blueprintJSON = {bodies : [{childs : [{"color":"19E753","controller":{"active":false,"controllers":[{"id":3}],"id":1,"joints":null},"pos":{"x":-4,"y":13,"z":3},"shapeId":"1e8d93a4-506b-470d-9ada-9c0a321e2db5","xaxis":3,"zaxis":1},{"color":"D02525","controller":{"active":false,"controllers":[{"id":4}],"id":2,"joints":null},"pos":{"x":-3,"y":13,"z":3},"shapeId":"7cf717d7-d167-4f2d-a6e7-6b2c70aa3986","xaxis":3,"zaxis":1},{"color":"19E753","controller":{"active":false,"controllers":[{"id":5},{"id":6}],"id":3,"joints":null,"mode":1},"pos":{"x":-3,"y":13,"z":3},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":-1,"zaxis":2},{"color":"D02525","controller":{"active":false,"controllers":[],"id":4,"joints":null,"mode":4},"pos":{"x":-2,"y":13,"z":3},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":-1,"zaxis":2},{"color":"DF7F00","controller":{"active":false,"controllers":[{"id":6}],"id":5,"joints":null,"mode":3},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2},{"color":"DF7F00","controller":{"active":false,"controllers":[],"id":6,"joints":null,"mode":0},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2}]}], version : 4};
    //MEMORABLE indexes: mute OR (3), 1-tick ON (5)
    let muteIDs = []
        tempBake.tones.forEach((i, p) => {
            let botUUID = "";
            if (i.type === 1) {botUUID = "1c04327f-1de4-4b06-92a8-2c9b40e491aa";}
            if (i.type === 2) {botUUID = "161786c1-1290-4817-8f8b-7f80de755a06";}
            if (i.type === 3) {botUUID = "a052e116-f273-4d73-872c-924a97b86720";}
            if (i.type === 4) {botUUID = "4c6e27a2-4c35-4df3-9794-5e206fef9012";}
            let nID = IDs[IDs.length-1]+1;
            IDs.push(nID);
            let nIDB = IDs[IDs.length-1]+1;
            IDs.push(nIDB);
            muteIDs.push(nIDB);
            blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"audioIndex":i.mode-1,"controllers":null,"id":nID,"joints":null,"pitch":i.tone,"volume":i.vol},"pos":{"x":-2,"y":13,"z":2},"shapeId":botUUID,"xaxis":-1,"zaxis":2});
            blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"active":false,"controllers":[{"id":nID}],"id":nIDB,"joints":null,"mode":0},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2});
            blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"active":false,"controllers":[{"id":nIDB}],"id":i.id,"joints":null,"mode":1},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2});
        });
        tempBake.durs.forEach((i, p) => {
            let dur = secondsANDTicks(i.duration)
            let fillID = IDs[IDs.length-1]+1;
            IDs.push(fillID);
            blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"active":false,"controllers":[{"id":i.extraid},{"id":i.tone}],"id":i.extraid,"joints":null,"mode":2},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2});
            blueprintJSON.bodies[0].childs.push({"color":"DF7F01","controller":{"active":false,"controllers":[{"id":i.extraid}],"id":fillID,"joints":null,"seconds":dur.seconds,"ticks":dur.ticks},"pos":{"x":-4,"y":14,"z":3},"shapeId":"8f7fd0e7-c46e-4944-a414-7ce2437bb30f","xaxis":-3,"zaxis":-2});
            blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"active":false,"controllers":[{"id":fillID},{"id":i.extraid}],"id":i.id,"joints":null,"mode":1},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2});
        });
        let nextNoteID = IDs[IDs.length-1]+1;
        IDs.push(nextNoteID);
        tempBake.notes.forEach((i, p) => {
            let nnID = IDs[IDs.length-1]+1;
            IDs.push(nnID);
            let curDur = i.delta;
            let fixpls = false;
            if (curDur > 60) {fixpls = true}
            if (fixpls === true) {
                let firstCurDur = true;
                let nextID = IDs[IDs.length-1]+1;
                let nexNextID = IDs[IDs.length-1]+2;
                while (curDur > 60) {
                    IDs.push(nextID);
                    if (firstCurDur === true) {blueprintJSON.bodies[0].childs.push({"color":"DF7F01","controller":{"active":false,"controllers":[{"id":nexNextID}],"id":nextNoteID,"joints":null,"seconds":59,"ticks":0},"pos":{"x":-4,"y":14,"z":3},"shapeId":"8f7fd0e7-c46e-4944-a414-7ce2437bb30f","xaxis":-3,"zaxis":-2});}
                    if (firstCurDur === false) {blueprintJSON.bodies[0].childs.push({"color":"DF7F01","controller":{"active":false,"controllers":[{"id":nexNextID}],"id":nextID,"joints":null,"seconds":59,"ticks":0},"pos":{"x":-4,"y":14,"z":3},"shapeId":"8f7fd0e7-c46e-4944-a414-7ce2437bb30f","xaxis":-3,"zaxis":-2});}
                    firstCurDur = false;
                    nextID = nexNextID;
                    nexNextID = IDs[IDs.length-1]+1;
                    curDur = curDur - 59;
                }
                let dur = secondsANDTicks(curDur);
                blueprintJSON.bodies[0].childs.push({"color":"DF7F01","controller":{"active":false,"controllers":[{"id":nnID},{"id":i.durlink}],"id":nextID,"joints":null,"seconds":dur.seconds,"ticks":dur.ticks},"pos":{"x":-4,"y":14,"z":3},"shapeId":"8f7fd0e7-c46e-4944-a414-7ce2437bb30f","xaxis":-3,"zaxis":-2});
                IDs.push(nextID);
            } else if (i.delta <= 60) {
                let dur = secondsANDTicks(i.delta);
                blueprintJSON.bodies[0].childs.push({"color":"DF7F01","controller":{"active":false,"controllers":[{"id":nnID},{"id":i.durlink}],"id":nextNoteID,"joints":null,"seconds":dur.seconds,"ticks":dur.ticks},"pos":{"x":-4,"y":14,"z":3},"shapeId":"8f7fd0e7-c46e-4944-a414-7ce2437bb30f","xaxis":-3,"zaxis":-2});
            }
            if (p === 0) {
                blueprintJSON.bodies[0].childs[5]["controller"]["controllers"].push({"id":nextNoteID});
            }
            nextNoteID = nnID;
        });
        blueprintJSON.bodies[0].childs.push({"color":"DF7F00","controller":{"active":false,"controllers":[{"id":3}],"id":nextNoteID,"joints":null,"mode":1},"pos":{"x":-2,"y":14,"z":2},"shapeId":"9f0f56e8-2c31-4d83-996c-d00a9b296c3f","xaxis":3,"zaxis":-2});

    muteIDs.forEach((k, v) => {
        blueprintJSON.bodies[0].childs[3]["controller"]["controllers"].push({"id":k});
    });
    return blueprintJSON;
}

let downloadJSON = function(filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bakeBlueprint(), null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

const input = document.createElement('input');
input.type = 'file';
input.accept = '.mid,.midi';

let arrayBufferToString = function(buffer) {
    const uint8Array = new Uint8Array(buffer);
    let result = '';
    for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i]);
    }
    return result;
}

let MIDI = {};
let config = {filename : "", tracks : []};

input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    config.filename = file.name;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
        const arrayBuffer = reader.result;
        appendTerminal("MIDI file ("+config.filename+") imported.");
        MIDI = MidiParser.parse(btoa(arrayBufferToString(arrayBuffer)))
        let str = "Processed MIDI tracks:<br>";
        let totalNotes = 0;
        let TEMPO = 0;
        let SPT = 0;
        if (LoadWithCustTemp === true) {SPT = 60/(MIDI.timeDivision*CustTemp); TEMPO = CustTemp}
        config = {filename : "", tracks : []};
        if (MIDI.track) {
            MIDI.track.forEach((k, v) => {
                let track = {Name : "", Totebot : 3, Mode : 1, NoteCount : 0, Volume : 100, NoteEvents : []};
                let absoluteTime = 0;
                let activeNotes = {};
                let lastOnset = 0;
                k.event.forEach((ev, i) => {
                    absoluteTime += ev.deltaTime;
                        if (ev.type === 255) {
                            if (ev.metaType === 3) {
                                track.Name = ev.data;
                            }
                            if (ev.metaType === 81) {
                                if (TEMPO === 0 && SPT === 0 && LoadWithCustTemp === false) {
                                TEMPO = Math.round(60000000/ev.data);
                                SPT = ev.data/(MIDI.timeDivision*1000000);
                                }
                            }
                        }
                        if (ev.type === 9 && ev.data[1] !== 0) {
                        track.NoteCount += 1;
                        totalNotes += 1;
                        activeNotes[ev.data[0]] = {
                            startTime: absoluteTime,
                            velocity: ev.data[1]
                        };

                        } else if (ev.type === 8 || (ev.type === 9 && ev.data[1] === 0)) {
                        const pitch = ev.data[0];
                        const noteOn = activeNotes[pitch];
                        if (noteOn) {
                            const duration = absoluteTime - noteOn.startTime;
                            const onsetGap = noteOn.startTime - lastOnset;
                            track.NoteEvents.push({
                                type: 0,
                                tone: Math.round(1000*normalizeKey(ev.data[0]))/1000,
                                timeSinceLast: onsetGap*SPT,
                                duration: duration*SPT
                            });
                            lastOnset = noteOn.startTime;
                            delete activeNotes[pitch];
                        }
                    }
                });
                track.Totebot = autoTotebot(track.Name)[0];
                track.Mode = autoTotebot(track.Name)[1];
                let tbt = "";
                let tbm = "";
                if (track.Totebot === 1) {
                    tbt = "Blip";
                }
                if (track.Totebot === 2) {
                    tbt = "Bass";
                }
                if (track.Totebot === 3) {
                    tbt = "Synth";
                }
                if (track.Totebot === 4) {
                    tbt = "Percussion";
                }
                if (track.Mode === 1) {
                    tbm = "Retro";
                }
                if (track.Mode === 2) {
                    tbm = "Dance";
                }
                str = str + "Track "+v+" - "+track.Name+": Notes - "+track.NoteCount+", -- SM CONFIG: TotebotType - "+tbt+", TotebotMode - "+tbm+", MaxVolume - 100%<br>";
                config.tracks.push(track);
            });
            appendTerminal(str+"<br>Tempo: "+TEMPO+" | Total No. notes: "+totalNotes);
        } else {appendTerminal("Error translating MIDI.")}
    };

    reader.onerror = () => {
        appendTerminal("Error importing MIDI.");
    };
}

let uploadMIDI = function() {
    input.click();
}

let texta = document.getElementById('TerminalWin');
let setTerminal = function(text) {
    texta.innerHTML = text;
    texta.scrollTop = texta.scrollHeight;
}

let appendTerminal = function(Xtext) {
    setTerminal(texta.innerHTML += ("<br>" + Xtext + "<br>"));
}

setTerminal("MIDI to Totebot Converter for Scrap Mechanic by Noiro1 (uses midi-parser-js v4.0.4 at https://github.com/colxi/midi-parser-js for midi reading), +help for commands<br>")

let LoadWithCustTemp = false;
let CustTemp = 0;

let commandsCheck = function(tex) {
    if (tex === "+help") {
        appendTerminal("List of commands:<br>+importMIDI -- opens a window to import a MIDI file (alt: +importMIDI(tempo) -- import with custom tempo)<br>+setTrackType(trackNum[0,1,2... etc.], totebotType[blip, bass, synth, percussion], totebotMode[retro, dance], maxVolume[0-100]) -- sets the head used for selected track and volume (default: synth, retro, 100 [0 to omit track entirely])<br>+exportBlueprint -- exports the MIDI file as a .json blueprint");
        return
    }
    if (tex === "+importMIDI") {
        appendTerminal("Opened file selector.");
        uploadMIDI();
        LoadWithCustTemp = false;
        return
    }
    if (tex === "+exportBlueprint") {
        appendTerminal("Downloading blueprint.json...");
        downloadJSON("blueprint.json");
        return
    }
    if (tex.includes("+setTrackType(")) {
        const regex = /\+setTrackType\(\s*([^,]+)\s*,\s*([^,]+)\s*,([^,]+)\s*,\s*([^)]+)\s*\)/;
        const matches = tex.match(regex);
        if (matches) {
            let query1 = Number(matches[1].replace(/\s+/, ""));
            let query2 = matches[2].replace(/\s+/, "");
            let query3 = matches[3].replace(/\s+/, "");
            let query4 = Number(matches[4].replace(/\s+/, ""));
            if (query2.toLowerCase() === "blip") {
                config.tracks[query1].Totebot = 1;
            }
            if (query2.toLowerCase() === "bass") {
                config.tracks[query1].Totebot = 2;
            }
            if (query2.toLowerCase() === "synth") {
                config.tracks[query1].Totebot = 3;
            }
            if (query2.toLowerCase() === "percussion") {
                config.tracks[query1].Totebot = 4;
            }
            if (query3.toLowerCase() === "retro") {
                config.tracks[query1].Mode = 1;
            }
            if (query3.toLowerCase() === "dance") {
                config.tracks[query1].Mode = 2;
            }
            config.tracks[query1].Volume = query4;
            let str = "Updated MIDI tracks:<br>";
            config.tracks.forEach((k,v) => {
                let tbt = "";
                let tbm = "";
                if (k.Totebot === 1) {
                    tbt = "Blip";
                }
                if (k.Totebot === 2) {
                    tbt = "Bass";
                }
                if (k.Totebot === 3) {
                    tbt = "Synth";
                }
                if (k.Totebot === 4) {
                    tbt = "Percussion";
                }
                if (k.Mode === 1) {
                    tbm = "Retro";
                }
                if (k.Mode === 2) {
                    tbm = "Dance";
                }
                str = str + "Track "+v+" - "+k.Name+": Tempo - "+k.Tempo+", Notes - "+k.NoteCount+", -- SM CONFIG: TotebotType - "+tbt+", TotebotMode - "+tbm+", MaxVolume - "+k.Volume+"%<br>";
            });
            appendTerminal(str+"<br>Changed Track "+query1+"'s config.");
            return
        }
    }
    if (tex.includes("+importMIDI(")) {
        const regex = /\(([^)]+)\)/;
        const matches = tex.match(regex);
        if (matches && matches[1] != "") {
            appendTerminal("Opened file selector with custom tempo of "+matches[1]+"BPM");
            LoadWithCustTemp = true;
            CustTemp = Number(matches[1]);
            uploadMIDI();
            return
        }
    }
    appendTerminal("Invalid command.")
}

const inputB = document.getElementById('TerminalIn');
inputB.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && inputB.value != "") {
      event.preventDefault();
      appendTerminal("-- " + inputB.value);
      commandsCheck(inputB.value);
      inputB.value = "";
    }
});

