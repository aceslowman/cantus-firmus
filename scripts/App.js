/* global Tone, ReactDOM, React */
const App = () => {
  /*
    this melody format isn't the best but it works with Tone.js
    
    the idea is that each array element is a measure,
    within the measure are voices. 
    
    due to the way that Tone.js Sequence handles nested arrays,
    I'm creating objects with number keys, so they behave the 
    same way, but don't get caught up in the Tone.js Sequence
    process.
  */
  let [melody, setMelody] = React.useState([
    [[{ 0: "C4" }], [{ 0: "D4" }], [{ 0: "G4" }], [{ 0: "F4" }]],
    [[{ 0: "G4" }], [{ 0: "A#4" }], [{ 0: "G4" }], [{ 0: "F4" }]],
    [[{ 0: "G4" }], [{ 0: "C5" }], [{ 0: "A#4" }], [{ 0: "G4" }]],
    [[{ 0: "D5" }], [{ 0: "G4" }], [{ 0: "F4" }], [{ 0: "G4" }]],
  ]);

  let [numBars, setNumBars] = React.useState(4);
  let [loop, setLoop] = React.useState(false);
  let [bpm, setBPM] = React.useState(120);
  let [melodyKey, setMelodyKey] = React.useState("C");
  let [melodyMode, setMelodyMode] = React.useState(5); // 

  let [soundOn, setSoundOn] = React.useState(true);
  let [sequence, setSequence] = React.useState();
  let [synth, setSynth] = React.useState();

  let [midiInputs, setMidiInputs] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);

  let [syncRhythm, setSyncRhythm] = React.useState(true);
  
  let [selectedNote, setSelectedNote] = React.useState(null);
  let [currentStep, setCurrentStep] = React.useState(0);
  let [isPlaying, setIsPlaying] = React.useState(false);

  let [subdivisions, setSubdivisions] = React.useState(4);
  let [ready, setReady] = React.useState(false);

  // ARC
  let [arcFrequency, setArcFrequency] = React.useState(2);
  let [arcAmplitude, setArcAmplitude] = React.useState(2);
  let [arcOffset, setArcOffset] = React.useState(0);

  // RANDOMIZE
  let [jitterAmount, setJitterAmount] = React.useState(2);

  /*
    set up keybindings
  */
  React.useEffect(() => {
    const keybindings = e => {
      switch (e.keyCode) {
        case 32: // space bar
          handleTogglePlay();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", keybindings, false);
    return () => document.removeEventListener("keydown", keybindings, false);
  }, [handleTogglePlay, sequence, setIsPlaying, isPlaying]);

  /*
    startup audio context
  */
  React.useEffect(() => {
    const startAudioContext = async () => {
      await Tone.start();
      console.log("audio context has started");
      Tone.Transport.bpm.value = parseFloat(bpm);
      setSynth(new Tone.PolySynth().toDestination());
      setReady(true);
    };

    if (!ready) {
      document.addEventListener("click", startAudioContext);
    } else {
      document.removeEventListener("click", startAudioContext);
    }

    return () => {
      document.removeEventListener("click", startAudioContext);
    };
  }, [ready, synth, setSynth]);

  /*
    set up midi
  */
  React.useEffect(() => {
    const initMIDI = async () => {
      if (!midiInputs || !midiOutputs) {
        await navigator.requestMIDIAccess().then(access => {
          // Get lists of available MIDI controllers
          let inputs,
            outputs = {};

          for (const input of access.inputs.values()) {
            inputs = {
              ...inputs,
              [input.id]: input
            };
          }

          for (const output of access.outputs.values()) {
            outputs = {
              ...outputs,
              [output.id]: output
            };
          }

          setMidiInputs(inputs);
          setMidiOutputs(outputs);

          setActiveMidiInput(inputs[Object.keys(inputs)[0]]);
          setActiveMidiOutput(outputs[Object.keys(outputs)[0]]);

          access.onstatechange = function(e) {
            // Print information about the (dis)connected MIDI controller
            console.log(e.port.name, e.port.manufacturer, e.port.state);
          };
        });
      }
    };

    initMIDI();
  }, [midiInputs, midiOutputs]);

  React.useEffect(() => {
    if (ready) Tone.Transport.bpm.value = parseFloat(bpm);
  }, [bpm]);

  /* 
    insert new measures 
  */
  React.useLayoutEffect(() => {
    if (numBars > melody.length) {
      let newMeasure = [];

      for (let i = 0; i < subdivisions; i++) {
        newMeasure.push([{ 0: "B4" }]); // TEMP: TODO: should initialize as REST
      }

      setMelody(prev => [...prev, newMeasure]);
    } else if (numBars < melody.length && numBars > 0) {
      setMelody(prev => {
        prev.pop();
        return [...prev];
      });
    }
  }, [numBars, melody, setMelody, subdivisions]);

  /* 
    create and update melody 
    
    // [NOTE ON, NOTE, VELOCITY]
  */
  React.useEffect(() => {
    if (ready && !syncRhythm) {
      const seqCallback = (time, voice) => {
        let note = voice[0]; // send first note of voicing
        activeMidiOutput.send([128, Tone.Frequency(note).toMidi(), 41]);
        setCurrentStep(Math.floor(sequence.progress * sequence.length));
        if (soundOn) synth.triggerAttackRelease(note, 0.1, time);
      };

      if (sequence) {
        sequence.events = melody;
        sequence.callback = seqCallback;
        sequence.loop = loop ? true : 1;
      } else {
        let newSequence = new Tone.Sequence(seqCallback, melody, "1m");
        newSequence.loop = loop ? true : 1;
        setSequence(newSequence);
      }
    }
  }, [
    melody,
    ready,
    sequence,
    setSequence,
    numBars,
    setCurrentStep,
    soundOn,
    loop,
    isPlaying,
    setIsPlaying,
    handleTogglePlay,
    syncRhythm
  ]);
  // NOTE: adding activeMidiOutput to the group causes way too many calls
  
  
  // TODO: DOING: 
  React.useLayoutEffect(()=> {
    // console.log('input changed...');
    const getNote = step => {
      let currentMeasure = Math.floor((currentStep+1) / 4) % numBars;
      let currentBeat = ((currentStep+1)) % 4;
      
      return melody[currentMeasure][currentBeat];
    }
    
    const handleMidiIn = m => {
      // console.log('midi incoming!', m)
      // check for notes coming in on channel 2
      
      let [noteon, currentNote, velocity] = m.data;
      currentNote = Tone.Frequency(currentNote, "midi").toNote();
      // console.log('[noteon, currentNote, velocity]', [noteon, currentNote, velocity])
      
      // if this matches the same kind of note sent from ditdah
      if(noteon === 0x91 && synth) {
        if(syncRhythm) {
          // WORKING WORKING WORKING ON THIS
          let note = getNote(currentStep);            
          activeMidiOutput.send([128, Tone.Frequency(note[0][0]).toMidi(), velocity]);
          if (soundOn) synth.triggerAttackRelease(note[0][0], 0.1);
          // HEADS UP this is out of sync
          setCurrentStep(prev => (prev + 1) % (numBars * 4));
        }
      }
    }
    
    if (activeMidiInput) {
      activeMidiInput.addEventListener("midimessage", handleMidiIn);
      return () =>
        activeMidiInput.removeEventListener("midimessage", handleMidiIn);
    }
  }, [activeMidiInput, melody, currentStep, setCurrentStep, soundOn, syncRhythm, synth])

  function handleLoopToggle(e) {
    // if (sequence) sequence.loop = !loop;
    setLoop(prev => !prev);
  }

  function handleNoteChange(e, measure_id, beat_id, voice_id) {
    let currentNote = melody[measure_id][beat_id][0][voice_id];
    let newMelody = [...melody];

    switch (e.keyCode) {
      case 37: // prev note
        break;
      case 38: // note up
        newMelody[measure_id][beat_id][0][voice_id] = Tone.Frequency(
          currentNote
        )
          .transpose(1)
          .toNote();
        break;
      case 40: // note down
        newMelody[measure_id][beat_id][0][voice_id] = Tone.Frequency(
          currentNote
        )
          .transpose(-1)
          .toNote();
        break;
      case 41: // next note
        break;
      default:
        break;
    }

    setMelody(newMelody);
  }

  const handleTogglePlay = e => {
    if (isPlaying) {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      sequence.cancel();
      sequence.stop();
      setIsPlaying(false);
    } else {
      Tone.Transport.cancel();
      sequence.start();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleRandomJitter = e => {
    /*
      random techniques...
      
      jitter: move notes up or down at random, in variable steps
      drunk: step up or down from the beginning within a certain range
      shuffle: keep notes and voices intact, but change order and position
    */
    setMelody(
      melody.map((measure, m_i) =>
        measure.map((beat, b_i) =>
          beat.map((voice, v_i) => ({
            ...Object.keys(voice).map((n, n_i) => {
              let note = voice[n];
              let tr = (Math.random() * 2 - 1) * jitterAmount;
              return Tone.Frequency(note)
                .transpose(tr)
                .toNote();
            })
          }))
        )
      )
    );
  };

  const getNoteDistance = (a, b) => {
    /*
      this method gets the 'absolute' difference
      between two notes. This means that an interval
      of an octave is 0, this is essentially:
    
      distance from either 0 or 12
    */
    a = Tone.Frequency(a).toMidi();
    b = Tone.Frequency(b).toMidi();

    let result = b - a;
    if (result % 12 === 0) a = 0;

    if (Math.abs(result) >= 6) result = (12 - result) * -1;

    return result;
  };

  // https://stackoverflow.com/questions/1985260/rotate-the-elements-in-an-array-in-javascript
  const arrayRotate = (arr, reverse) => {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
  };

  const handleApplyKey = e => {
    let base_mode = [2, 2, 1, 2, 2, 2, 1];

    for (let i = 0; i < melodyMode; i++) {
      base_mode = arrayRotate(base_mode);
    }

    let base_octave = 4;

    let acc = 0;
    let keyScale = base_mode.map(e => {
      let next_note = Tone.Frequency(`${melodyKey}${base_octave}`)
        .transpose(acc)
        .toNote();

      acc = acc + e;

      return next_note;
    });

    setMelody(
      melody.map((measure, m_i) =>
        measure.map((beat, b_i) =>
          beat.map((voice, v_i) => ({
            ...Object.keys(voice).map((n, n_i) => {
              let note = voice[n];

              let distances = keyScale.map(val => {
                // adjust to same octave
                return getNoteDistance(note, val);
              });

              let a = 12;
              distances.forEach((d, i) => {
                if (Math.abs(d) <= Math.abs(a)) a = d;
              });

              return Tone.Frequency(note)
                .transpose(a)
                .toNote();
            })
          }))
        )
      )
    );
  };

  const handleApplyArc = e => {
    let step = 0;
    setMelody(
      melody.map((measure, m_i) =>
        measure.map((beat, b_i) =>
          beat.map((voice, v_i) => ({
            ...Object.keys(voice).map((n, n_i) => {
              let note = voice[n];
              let arc = Math.sin(step * arcFrequency);
              arc = Math.round(arc);
              arc *= arcAmplitude;
              step++;
              return Tone.Frequency(note)
                .transpose(arc)
                .toNote();
            })
          }))
        )
      )
    );
  };

  const handleResetMelody = e => {
    setMelody(
      melody.map((measure, m_i) =>
        measure.map((beat, b_i) =>
          beat.map((voice, v_i) => ({
            ...Object.keys(voice).map((n, n_i) => {
              return `${melodyKey}4`;
            })
          }))
        )
      )
    );
  };

  const handleChangeMelodyMode = e => setMelodyMode(e.target.value);
  const handleToggleSoundOn = e => setSoundOn(prev => !prev);
  const handleArcFrequencyChange = e => setArcFrequency(e.target.value);
  const handleArcAmplitudeChange = e => setArcAmplitude(e.target.value);
  const handleArcOffsetChange = e => setArcOffset(e.target.value);
  const handleChangeMelodyKey = e => setMelodyKey(e.target.value);
  const handleNumBarsChange = e => setNumBars(e.target.value);
  const handleBPMChange = e => setBPM(parseFloat(e.target.value));
  const handleJitterAmountChange = e => setJitterAmount(e.target.value);
  const handleMidiInputChange = e =>
    setActiveMidiInput(midiInputs[e.target.value]);
  const handleMidiOutputChange = e =>
    setActiveMidiOutput(midiOutputs[e.target.value]);
    
  const handleToggleSyncRhythm = e => setSyncRhythm(prev => !prev)

  return (
    <React.Fragment>
      <Settings
        onTogglePlay={handleTogglePlay}
        onMidiInputChange={handleMidiInputChange}
        onMidiOutputChange={handleMidiOutputChange}
        onToggleLoop={handleLoopToggle}
        onNumBarsChange={handleNumBarsChange}
        onBPMChange={handleBPMChange}
        onRandomJitter={handleRandomJitter}
        onJitterAmountChange={handleJitterAmountChange}
        bpm={bpm}
        melodyKey={melodyKey}
        loop={loop}
        numBars={numBars}
        isPlaying={isPlaying}
        midiInputs={midiInputs}
        midiOutputs={midiOutputs}
        activeMidiInput={activeMidiInput}
        activeMidiOutput={activeMidiOutput}
        currentStep={currentStep}
        jitterAmount={jitterAmount}
        onArcFrequencyChange={handleArcFrequencyChange}
        arcFrequency={arcFrequency}
        onArcAmplitudeChange={handleArcAmplitudeChange}
        arcAmplitude={arcAmplitude}
        onArcOffsetChange={handleArcOffsetChange}
        onApplyKey={handleApplyKey}
        onApplyArc={handleApplyArc}
        onResetMelody={handleResetMelody}
        onChangeMelodyKey={handleChangeMelodyKey}
        onToggleSoundOn={handleToggleSoundOn}
        soundOn={soundOn}
        onChangeMelodyMode={handleChangeMelodyMode}
        melodyMode={melodyMode}
        syncRhythm={syncRhythm}
        onToggleSyncRhythm={handleToggleSyncRhythm}
      />
      <MusicStaff
        melody={melody}
        onNoteChange={handleNoteChange}
        currentStep={currentStep}
      />
    </React.Fragment>
  );
};

const domContainer = document.getElementById("APP");
ReactDOM.render(React.createElement(App), domContainer);
