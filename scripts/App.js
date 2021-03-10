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
    [[{ 0: "C4" }], [{ 0: "D4" }], [{ 0: "E4" }], [{ 0: "F#4" }]],
    [[{ 0: "G4" }], [{ 0: "A#4" }], [{ 0: "G4" }], [{ 0: "B4" }]],
    [[{ 0: "A#4" }], [{ 0: "G4" }], [{ 0: "F#4" }], [{ 0: "B4" }]]
  ]);

  let [numBars, setNumBars] = React.useState(3);
  let [loop, setLoop] = React.useState(false);
  let [bpm, setBPM] = React.useState(120);
  let [selectedNote, setSelectedNote] = React.useState(null);
  let [midiInputs, setMidiInputs] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);
  let [currentStep, setCurrentStep] = React.useState(0);
  let [isPlaying, setIsPlaying] = React.useState(false);
  let [subdivisions, setSubdivisions] = React.useState(4);
  let [jitterAmount, setJitterAmount] = React.useState(2);
  let [ready, setReady] = React.useState(false);

  
  let [sequence, setSequence] = React.useState();
  let synth;

  /*
    set up keybindings
  */
  React.useEffect(() => {
    console.log("seq", sequence);
    const keybindings = e => {
      switch (e.keyCode) {
        case 32: // space bar
          console.log("sequence", sequence);
          handleTogglePlay();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", keybindings, false);
    return () => document.removeEventListener("keydown", keybindings, false);
  }, [handleTogglePlay, sequence]);

  /*
    startup audio context
  */
  React.useEffect(() => {
    const startAudioContext = async () => {
      await Tone.start();
      console.log("audio context has started");
      setReady(true);
      synth = new Tone.Synth().toDestination();
      Tone.Transport.bpm.value = parseFloat(bpm);
    };

    if (!ready) {
      document.addEventListener("click", startAudioContext);
    } else {
      document.removeEventListener("click", startAudioContext);
    }

    return () => {
      document.removeEventListener("click", startAudioContext);
    };
  }, [ready, synth]);

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

  /* insert new measures */
  React.useEffect(() => {
    if (numBars > melody.length) {
      let newMeasure = [];

      for (let i = 0; i < subdivisions; i++) {
        newMeasure.push(["B4"]); // TEMP: TODO: should initialize as REST
      }

      setMelody(prev => [...prev, newMeasure]);
    } else if (numBars < melody.length && numBars > 0) {
      setMelody(prev => prev.splice(-1, 1));
    }
  }, [numBars, melody]);

  /* create and update melody */
  React.useEffect(() => {
    console.log("hello");
    if (ready) {
      if (sequence) {
        Tone.Transport.cancel();
        sequence.events = melody;
      } else {
        // set up toneJS to repeat melody in sequence
        setSequence(new Tone.Sequence(
          (time, voice) => {
            let note = voice[0]; // send first note of voicing
            // synth.triggerAttackRelease(note, 0.1, time);
            // [NOTE ON, NOTE, VELOCITY]
            // TODO: spit out multiple voicings to make polyphonic
            activeMidiOutput.send([128, Tone.Frequency(note).toMidi(), 41]);
            // console.log('sending midi... ', [128, Tone.Frequency(note).toMidi(), 41])

            setCurrentStep(
              prev => (prev = (prev + 1) % (melody.length * 4))
            );
          },
          melody,
          "1m"
        ));
      }
      Tone.Transport.start();
    }
  }, [melody, ready, sequence]);
  // NOTE: adding activeMidiOutput to the group causes way too many calls

  function handleLoopToggle(e) {
    if (sequence) sequence.loop.value = !loop;
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

  const handleNumBarsChange = e => setNumBars(e.target.value);

  const handleBPMChange = e => setBPM(parseFloat(e.target.value));

  const handleMidiInputChange = e =>
    setActiveMidiInput(midiInputs[e.target.value]);

  const handleMidiOutputChange = e =>
    setActiveMidiOutput(midiOutputs[e.target.value]);

  const handleJitterAmountChange = e => setJitterAmount(e.target.value);

  const handleTogglePlay = e => {
    if (sequence.state === "started") {
      console.log("stop");
      sequence.stop();
      setIsPlaying(false);
    } else {
      console.log("play");
      sequence.start();
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
        loop={loop}
        numBars={numBars}
        isPlaying={isPlaying}
        midiInputs={midiInputs}
        midiOutputs={midiOutputs}
        activeMidiInput={activeMidiInput}
        activeMidiOutput={activeMidiOutput}
        currentStep={currentStep}
        jitterAmount={jitterAmount}
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
