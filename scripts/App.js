/* global Tone, ReactDOM, React */
const App = () => {
  let [melody, setMelody] = React.useState([
    ["C4", "D4", "E4", "F#4"],
    ["G4", "A#4", "G4", "B4"],
    ["A#4", "G4", "F#4", "B4"]
  ]);

  let [loop, setLoop] = React.useState(false);
  let [numBars, setNumBars] = React.useState(1);

  let [selectedNote, setSelectedNote] = React.useState(null);
  let [midiInputs, setMidiInputs] = React.useState(null);
  let [activeMidiInput, setActiveMidiInput] = React.useState(null);
  let [midiOutputs, setMidiOutputs] = React.useState(null);
  let [activeMidiOutput, setActiveMidiOutput] = React.useState(null);
  let [bpm, setBPM] = React.useState(120);

  const synth = new Tone.Synth().toDestination();
  let sequence;

  React.useEffect(() => {
    const keybindings = function(e) {
      console.log("key", e.keyCode);
      console.log(Tone.Transport.state)
      switch(e.keyCode) {
        case 32: // space bar
          if(Tone.Transport.state === "started") {            
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

  React.useEffect(() => {
    const initMIDI = async () => {
      if (!midiInputs || !midiOutputs) {
        await navigator.requestMIDIAccess().then(access => {
          // Get lists of available MIDI controllers
          const inputs = access.inputs.values();
          const outputs = access.outputs.values();

          setMidiInputs(inputs);
          setMidiOutputs(outputs);
          
          console.log("INPUTS", outputs)
          
          // setActiveMidiInput([...inputs][0]);
          // setActiveMidiOutput([...outputs][0]);

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
    Tone.Transport.cancel();

    if (sequence) {
      sequence.events = melody;
    } else {
      // set up toneJS to repeat melody in sequence
      sequence = new Tone.Sequence(
        (time, note) => {
          synth.triggerAttackRelease(note, 0.1, time);
          activeMidiInput.send([144,40,41]);
        },
        melody,
        "4n"
      ).start(0);
    }

    Tone.Transport.start();
  }, [melody]);

  function handleLoopToggle(e) {
    if (sequence) sequence.loop.value = !loop;
    setLoop(prev => !prev);
  }

  function handleNumBarsChange(e) {
    // state.pauseAfterWord = e.target.value;
    // restartSynth();
  }

  function handleBPMChange(e) {
    setBPM(parseFloat(e.target.value));
    Tone.Transport.bpm.value = parseFloat(e.target.value);
  }

  function handleNoteChange(e, measure_id, note_id) {
    let currentNote = melody[measure_id][note_id];
    let newMelody = [...melody];

    switch (e.keyCode) {
      case 37: // left
        // shift focus to prev element
        break;
      case 38: // up
        newMelody[measure_id][note_id] = Tone.Frequency(currentNote)
          .transpose(1)
          .toNote();
        break;
      case 40: // down
        newMelody[measure_id][note_id] = Tone.Frequency(currentNote)
          .transpose(-1)
          .toNote();
        break;
      case 41: // right
        // shift focus to next element
        break;
      default:
        break;
    }

    setMelody(newMelody);
  }

  const handleMidiInputChange = e => {
    console.log("input", e.target.value);
    let device_id = e.target.value;

    // set input/output
    setActiveMidiInput([...inputs][0]);
  };

  const handleMidiOutputChange = e => {
    console.log("output", e.target.value);
    let device_id = e.target.value;

    // set input/output
    setActiveMidiOutput([...outputs][0]);
  };

  const handlePressPlay = e => {
    Tone.start();
    Tone.Transport.start();
  };

  const handlePressStop = e => {
    Tone.Transport.stop();
  };
  
  if(sequence)
    console.log("HEY CHECK HERE", sequence.progress)

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
        bpm={bpm}
        loop={loop}
        midiInputs={midiInputs}
        midiOutputs={midiOutputs}
      />
      <MusicStaff melody={melody} onNoteChange={handleNoteChange} />
    </React.Fragment>
  );
};

const domContainer = document.getElementById("APP");
ReactDOM.render(React.createElement(App), domContainer);
