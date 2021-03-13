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
        <div className="inputSection">
          <h3>basic</h3>
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
        </div>
        <div className="inputSection">
          <h3>generate</h3>
          
          <div className="buttonGroup">
            <label htmlFor="">key</label>
            <select>
              <option value="major">major</option>
              
            </select>
          </div>

          <label htmlFor="jitter_amount">amount</label>
          <div className="buttonGroup">
            <input
              id="jitter_amount"
              onChange={props.onJitterAmountChange}
              className="jitterAmountInput"
              type="number"
              step="1"
              value={props.jitterAmount}
            />

            <button onClick={props.onRandomJitter} className="randomizeButton">
              random jitter
            </button>
          </div>
        </div>
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
          <div className="inputGroup">
            <label htmlFor="midioutputs">Midi Output</label>
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
            <MIDILog device={props.activeMidiInput} />
          </div>
        </div>

        <div className="buttonGroup">
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
