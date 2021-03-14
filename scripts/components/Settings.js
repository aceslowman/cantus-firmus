const InputPanel = props => {
  return (
    <div className="inputSection">
      <h3>{props.title}</h3>
      {props.children}
    </div>
  );
};

/* global Tone, ReactDOM, React */
const Settings = props => {
  let [expanded, setExpanded] = React.useState();

  let style = {
    width: "0%"
  };

  // SETTINGS TOGGLE
  function toggleSettings() {
    setExpanded(prev => !prev);
  }

  return (
    <div className="SETTINGS" style={{ width: expanded ? "28%" : "0%" }}>
      <div className="settingsInner">
        <InputPanel title="basic">
          <label>number of bars</label>
          <input
            onChange={props.onNumBarsChange}
            className="numBarsInput"
            type="number"
            step="1"
            value={props.numBars}
          />

          <label>tempo</label>
          <input
            onChange={props.onBPMChange}
            className="tempoInput"
            type="number"
            step="1"
            value={props.bpm}
          />
          <br />
          <button onClick={props.onResetMelody}>reset melody</button>
        </InputPanel>
        <InputPanel title="generate">
          <div className="inputRow">
            <label htmlFor="keyselect">key</label>
            <select
              onChange={props.onChangeMelodyKey}
              id="keyselect"
              value={props.melodyKey}
            >
              <option value="C">C</option>
              <option value="C#">C#</option>
              <option value="D">D</option>
              <option value="D#">D#</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="F#">F#</option>
              <option value="G">G</option>
              <option value="G#">G#</option>
              <option value="A">A</option>
              <option value="A#">A#</option>
              <option value="B">B</option>
            </select>
            <button onClick={props.onApplyKey}>apply key</button>
          </div>

          <div className="inputRow">
            <label htmlFor="modeselect">mode</label>
            <select id="modeselect">
              <option value="major">major</option>
              <option value="naturalminor">natural minor</option>
              <option value="harmonicminor">harmonic minor</option>
            </select>
          </div>

          <div className="inputSection">
            <h4>arc</h4>

            <div className="inputRow">
              <div className="inputGroup" style={{ width: "48%" }}>
                <label htmlFor="arcFrequency">frequency</label>
                <input
                  onChange={props.onArcFrequencyChange}
                  id="arcFrequency"
                  type="number"
                  step="1"
                  value={props.arcFrequency}
                />
              </div>

              <div className="inputGroup" style={{ width: "48%" }}>
                <label htmlFor="arcAmplitude">amplitude</label>
                <input
                  onChange={props.onArcAmplitudeChange}
                  id="arcAmplitude"
                  type="number"
                  step="1"
                  value={props.arcAmplitude}
                />
              </div>
            </div>
            <div className="inputRow">
              <div className="inputGroup" style={{ width: "48%" }}>
                <label htmlFor="arcOffset">offset</label>
                <input
                  onChange={props.onArcOffsetChange}
                  id="arcOffset"
                  type="number"
                  step="1"
                  value={props.arcOffset}
                />
              </div>
              <div className="inputGroup" style={{ width: "48%" }}>
                <button onClick={props.onApplyArc}>apply arc</button>
              </div>
            </div>
          </div>

          <InputPanel title="randomize">
            <label htmlFor="jitter_amount">amount</label>
            <div className="inputRow">
              <input
                id="jitter_amount"
                onChange={props.onJitterAmountChange}
                className="jitterAmountInput"
                type="number"
                step="1"
                value={props.jitterAmount}
              />

              <button onClick={props.onRandomJitter}>random jitter</button>
            </div>
          </InputPanel>
        </InputPanel>
        {/* <div className="inputGroup">
          <label htmlFor="midiinputs">Midi Input</label>
          <select
            name="midiinputs"
            value={props.activeMidiInput ? props.activeMidiInput.id : ""}
            onChange={props.onMidiInputChange}
          >
            <option>select an input</option>
            {props.midiInputs &&
              Object.keys(props.midiInputs).map(e => {
                return (
                  <option key={e} value={props.midiInputs[e].id}>
                    {props.midiInputs[e].name}
                  </option>
                );
              })}
          </select>
          <MIDILog device={props.activeMidiInput} />
        </div>*/}
        <div className="inputSection">
          <h3>MIDI</h3>
          <div className="inputRow">
            <label htmlFor="midioutputs">output</label>
            <select
              name="midioutputs"
              value={props.activeMidiOutput ? props.activeMidiOutput.id : ""}
              onChange={props.onMidiOutputChange}
            >
              <option>select an output</option>
              {props.midiOutputs &&
                Object.keys(props.midiOutputs).map(e => {
                  return (
                    <option key={e} value={props.midiOutputs[e].id}>
                      {props.midiOutputs[e].name}
                    </option>
                  );
                })}
            </select>
          </div>

          <MIDILog device={props.activeMidiInput} />
        </div>

        <div className="inputRow">
          <div className="inputGroup">
            <label>
              loop
              <input
                onChange={props.onToggleLoop}
                checked={props.loop}
                className="loopButton"
                type="checkbox"
              />
            </label>
          </div>
          <button
            onClick={props.onTogglePlay}
            className="playButton"
            style={{
              color: props.isPlaying ? "#fff" : "#602500",
              backgroundColor: props.isPlaying ? "#602500" : "#fff"
            }}
          >
            {props.isPlaying ? "stop" : "play"}
          </button>
        </div>
      </div>
      <div className="credits">cantus firmus by aceslowman 2021</div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};
