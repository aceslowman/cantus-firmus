/* global Tone, ReactDOM, React */
const App = () => {
  let [melody, setMelody] = React.useState([
    ["C4", "D4", "E4", "F#4"],
    ["G4", "A#4", "G4", "B4"],
    ["A#4", "G4", "F#4", "B4"]
  ]);

  let [loop, setLoop] = React.useState(false);
  let [numBars, setNumBars] = React.useState(1);
  let [bpm, setBPM] = React.useState(120);
  let [selectedNote, setSelectedNote] = React.useState(null);
  let [midiInputs, setMidiInputs] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);
  let [currentStep, setCurrentStep] = React.useState(0);

  const synth = new Tone.Synth().toDestination();
  let sequence;

  /*
    set up keybindings
  */
  React.useEffect(() => {
    const keybindings = function(e) {
      console.log("key", e.keyCode);
      console.log(Tone.Transport.state);
      switch (e.keyCode) {
        case 32: // space bar
          if (Tone.Transport.state === "started") {
            Tone.Transport.stop();
          } else {
            Tone.start();
            Tone.Transport.start();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", keybindings, false);
    return () => document.removeEventListener("keydown", keybindings, false);
  }, []);

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

  /* create and update melody */
  React.useEffect(() => {
    Tone.Transport.cancel();

    if (sequence) {
      sequence.events = melody;
    } else {
      // set up toneJS to repeat melody in sequence
      sequence = new Tone.Sequence(
        (time, note) => {
          console.log("progress", sequence.events.length);
          // synth.triggerAttackRelease(note, 0.1, time);
          // [NOTE ON, NOTE, VELOCITY]
          activeMidiOutput.send([128, Tone.Frequency(note).toMidi(), 41]);
          
          setCurrentStep(prev => prev = (prev + 1) % (sequence.events.length * 4));
        },
        melody,
        "1m"
      ).start(0);
    }

    Tone.Transport.start();
  }, [melody, activeMidiOutput]);

  function handleLoopToggle(e) {
    if (sequence) sequence.loop.value = !loop;
    setLoop(prev => !prev);
  }

  function handleNumBarsChange(e) {
    setNumBars(e.target.value);
  }

  function handleBPMChange(e) {
    setBPM(parseFloat(e.target.value));
    Tone.Transport.bpm.value = parseFloat(e.target.value);
  }

  function handleNoteChange(e, measure_id, note_id) {
    let currentNote = melody[measure_id][note_id];
    let newMelody = [...melody];

    switch (e.keyCode) {
      case 37: // prev note
        break;
      case 38: // note up
        newMelody[measure_id][note_id] = Tone.Frequency(currentNote)
          .transpose(1)
          .toNote();
        break;
      case 40: // note down
        newMelody[measure_id][note_id] = Tone.Frequency(currentNote)
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

  const handleMidiInputChange = e => {
    setActiveMidiInput(midiInputs[e.target.value]);
  };

  const handleMidiOutputChange = e => {
    setActiveMidiOutput(midiOutputs[e.target.value]);
  };

  const handlePressPlay = e => {
    Tone.start();
    Tone.Transport.start();
  };

  const handlePressStop = e => {
    Tone.Transport.stop();
  };

  const handleRandomize = e => {
    // TODO: loop over the melody and fill procedurally
    
    setMelody(melody.map((measure, m_i) => {
      return measure.map((note, n_i) => {
        console.log('check', note)
        return note;
      })
    }))
  };

  return (
    <React.Fragment>
      <Settings
        onPressPlay={handlePressPlay}
        onPressStop={handlePressStop}
        onMidiInputChange={handleMidiInputChange}
        onMidiOutputChange={handleMidiOutputChange}
        onToggleLoop={handleLoopToggle}
        onNumBarsChange={handleNumBarsChange}
        onBPMChange={handleBPMChange}
        onRandomize={handleRandomize}
        bpm={bpm}
        loop={loop}
        midiInputs={midiInputs}
        midiOutputs={midiOutputs}
        activeMidiInput={activeMidiInput}
        activeMidiOutput={activeMidiOutput}
        currentStep={currentStep}
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
