/* global Tone, ReactDOM, React */
const Settings = props => {
  let [expanded, setExpanded] = React.useState();
  
  let style = {
    width: '0%'
  }
  
  // SETTINGS TOGGLE
  function toggleSettings() {
    setExpanded(prev => !prev)
  }
  
  return (
    <div className="SETTINGS" style={{width: expanded ? '28%' : '0%'}}>
      <div className="settingsInner">
        <div>
          <label>number of bars</label>
          <input
            onChange={props.onNumBarsChange}
            className="numBarsInput"
            type="number"
            step="1"
            value="1"
          />
        </div>
        <div>
          <label>tempo</label>
          <input
            onChange={props.onBPMChange}
            className="tempoInput"
            type="number"
            step="1"
            value={props.bpm}
          />
        </div>
        <div>
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
        <div>
            <button
              onClick={props.onRandomize}
              className="randomizeButton"
              >randomize</button>
        </div>
        <div>
            <button
              onClick={props.onPressPlay}
              className="playButton"
              >play</button>
        </div>
        <div>
            <button
              onClick={props.onPressStop}
              className="stopButton"
              >stop</button>
        </div>
        <div>
          <label htmlFor="midiinputs">Midi Input</label>
          <select name="midiinputs" onChange={props.onMidiInputChange}>
            <option>select an input</option>
            {props.midiInputs && [...props.midiInputs].map(e => {
              return (
                <option key={e.id} value={e.id}>{e.name}</option>
              )
            })}
          </select>
        </div>
        <div>
          <label htmlFor="midioutputs">Midi Output</label>
          <select name="midioutputs" onChange={props.onMidiOutputChange}>
            <option>select an output</option>
            {props.midiOutputs && [...props.midiOutputs].map(e => {
              return (
                <option key={e.id} value={e.id}>{e.name}</option>
              )
            })}
          </select>
        </div>
      </div>
      <div className="credits">cantus firmus by aceslowman 2021</div>
      <div className="toggleSettings" onClick={toggleSettings}></div>
    </div>
  );
};
