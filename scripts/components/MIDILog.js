/* global Tone, ReactDOM, React */
const MIDILog = props => {
  const [enable, setEnable] = React.useState(false);
  const [log, setLog] = React.useState([]);
  const tail_length = 10; // limit length of log

  return (
    <div className="MIDILog">
      <label htmlFor="midilog">MIDI log: </label>
      {enable && <pre id="midilog">{log}</pre>}
    </div>
  );
};
