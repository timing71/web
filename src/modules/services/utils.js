export const parseTime = (raw) => {
  if (raw.match(/^[0-9]+(\.[0-9]+)?$/)) {
    return parseFloat(raw);
  }
  if (raw.match(/^[0-9]+:[0-9]+(\.[0-9]+)?$/)) {
    const [mins, secs] = raw.split(':');
    return (60 * parseInt(mins, 10)) + parseFloat(secs);
  }
  if (raw.match(/^[0-9]+:[0-9]+:[0-9]+(\.[0-9]+)?$/)) {
    const [hours, mins, secs] = raw.split(':');
    return (3600 * parseInt(hours, 10)) + (60 * parseInt(mins, 10)) + parseFloat(secs);
  }
};
