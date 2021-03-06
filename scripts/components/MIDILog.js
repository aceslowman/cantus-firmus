/* global Tone, ReactDOM, React */
const MIDILog = props => {
  const [enable, setEnable] = React.useState(true);
  const [log, setLog] = React.useState([]);
  const tail_length = 10; // limit length of log

  React.useEffect(() => {
    const handleDeviceLog = m => {
      let [noteon, note, velocity] = m.data;
      // noteon: 144(on) or 128(off)
      // pitch: 0-127
      // velocity: 0-127
      // log.push(`noteon:${noteon}, pitch:${pitch}, velocity:${velocity} \n`);
      log.push({noteon, note, velocity});
      if (log.length > tail_length) log.shift();
      setLog(log);
    };

    if (props.device) {
      props.device.addEventListener("midimessage", handleDeviceLog);
      return () =>
        props.device.removeEventListener("midimessage", handleDeviceLog);
    }
  }, [props.device, log, setLog]);

  return (
    <div>
      <label htmlFor="midilog">MIDI log: </label>
      {enable && (
        <table>
          <th>
            <td>noteon</td>
            <td>note</td>
            <td>velocity</td>
          </th>
          {log.map((e, i) => {
            return (
              <tr>
                <td>{e.noteon}</td>
                <td>{e.note}</td>
                <td>{e.velocity}</td>
              </tr>
            );
          })}
        </table>
      )}
    </div>
  );
};
