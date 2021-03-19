/* global Tone, ReactDOM, React */
const InputPanel = props => (
  <div
    style={{
      display: "flex",
      margin: "5px 0px",
      width: "100%",
      flexFlow: "column",
      border: "1px groove #602500",
      padding: "10px"
    }}
  >
    <h3 style={{ margin: "0px 0px 8px 0px" }}>{props.title}</h3>
    {props.children}
  </div>
);

const InputGroup = props => (
  <div
    style={{
      display: "flex",
      flexFlow: "column",
      alignSelf: "flex-end",
      width: "48%"
    }}
  >
    {props.children}
  </div>
);

const InputRow = props => (
  <div
    style={{
      display: "flex",
      flexFlow: "row",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "5px"
    }}
  >
    {props.children}
  </div>
);

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
    <div className="SETTINGS" style={{ width: expanded ? "300px" : "0%" }}>
      <div className="settingsInner">
        <InputPanel title="basic">
          <InputRow>
            <InputGroup>
              <label>number of bars</label>
              <input
                onChange={props.onNumBarsChange}
                className="numBarsInput"
                type="number"
                step="1"
                value={props.numBars}
              />
            </InputGroup>
            <InputGroup>
              <label>tempo</label>
              <input
                onChange={props.onBPMChange}
                className="tempoInput"
                type="number"
                step="1"
                value={props.bpm}
              />
            </InputGroup>
          </InputRow>
          <button onClick={props.onResetMelody}>reset melody</button>
        </InputPanel>

        <InputPanel title="generate">
          <InputRow>
            <InputGroup>
              <label htmlFor="keyselect">key</label>
              <select
                id="keyselect"
                onChange={props.onChangeMelodyKey}
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
            </InputGroup>
            <InputGroup>
              <label htmlFor="modeselect">mode</label>
              <select
                id="modeselect"
                onChange={props.onChangeMelodyMode}
                value={props.melodyMode}
              >
                <option value="0">Ionian (major)</option>
                <option value="1">Dorian</option>
                <option value="2">Phrygian</option>
                <option value="3">Lydian</option>
                <option value="4">Mixolydian</option>
                <option value="5">Aeolian (natural minor)</option>
                <option value="6">Locrian</option>
              </select>
            </InputGroup>
          </InputRow>

          <button onClick={props.onApplyKey}>nudge to key</button>

          <InputPanel title="arc">
            <InputRow>
              <InputGroup>
                <label htmlFor="arcFrequency">frequency</label>
                <input
                  onChange={props.onArcFrequencyChange}
                  id="arcFrequency"
                  type="number"
                  step="1"
                  value={props.arcFrequency}
                />
              </InputGroup>

              <InputGroup>
                <label htmlFor="arcAmplitude">amplitude</label>
                <input
                  onChange={props.onArcAmplitudeChange}
                  id="arcAmplitude"
                  type="number"
                  step="1"
                  value={props.arcAmplitude}
                />
              </InputGroup>
            </InputRow>
            <InputRow>
              <InputGroup>
                <label htmlFor="arcOffset">offset</label>
                <input
                  onChange={props.onArcOffsetChange}
                  id="arcOffset"
                  type="number"
                  step="1"
                  value={props.arcOffset}
                />
              </InputGroup>
              <InputGroup>
                <button onClick={props.onApplyArc}>apply arc</button>
              </InputGroup>
            </InputRow>
          </InputPanel>

          <InputPanel title="randomize">
            <InputRow>
              <InputGroup>
                <label htmlFor="jitter_amount">amount</label>
                <input
                  id="jitter_amount"
                  onChange={props.onJitterAmountChange}
                  type="number"
                  step="1"
                  value={props.jitterAmount}
                />
              </InputGroup>
              <InputGroup>
                <button onClick={props.onRandomJitter}>random jitter</button>
              </InputGroup>
            </InputRow>
          </InputPanel>
        </InputPanel>
        <InputPanel title="MIDI">
          <InputRow>
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
          </InputRow>

          <MIDILog device={props.activeMidiInput} />
        </InputPanel>
        <InputPanel title="playback">
          <InputRow>
            <InputGroup>
              <label>
                loop
                <input
                  onChange={props.onToggleLoop}
                  checked={props.loop}
                  type="checkbox"
                />
              </label>
            </InputGroup>
            <InputGroup>
              <label>
                sound
                <input
                  onChange={props.onToggleSoundOn}
                  checked={props.soundOn}
                  type="checkbox"
                />
              </label>
            </InputGroup>
          </InputRow>
          <button
            onClick={props.onTogglePlay}
            style={{
              color: props.isPlaying ? "#fff" : "#602500",
              backgroundColor: props.isPlaying ? "#602500" : "#fff"
            }}
          >
            {props.isPlaying ? "stop" : "play"}
          </button>
        </InputPanel>
        <div className="credits">
          <a href="https://github.com/aceslowman/cantus-firmus" target="_blank">
            <strong>cantus firmus</strong>           
          </a>
          &nbsp;by&nbsp;
          <a href="https://linktr.ee/aceslowman" target="_blank">
            aceslowman
          </a>
           2021
        </div>
      </div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};
