/* global Tone, ReactDOM, React */
const MIDILog = props => {
  const [enable, setEnable] = React.useState(true);
  const [log, setLog] = React.useState([]);
  const tail_length = 10; // limit length of log

  React.useEffect(() => {
    const handleDeviceLog = m => {
      console.log("getting message", m);
      let [noteon, pitch, velocity] = m.data;
      log.push(`${}`);
      // log.shift();
      setLog(log);
    };

    if (props.device) {
      props.device.addEventListener("midimessage", handleDeviceLog);
      return () =>
        props.device.removeEventListener("midimessage", handleDeviceLog);
    }
  }, [props.device, log, setLog]);

  return (
    <div
      style={{
        overflow: scroll
      }}
    >
      <label htmlFor="midilog">MIDI log: </label>
      {enable && <pre id="midilog">{log}</pre>}
    </div>
  );
};
