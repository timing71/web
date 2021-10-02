export const timeInSeconds = (seconds, places=3) => {
  if (isNaN(seconds) || seconds === '' || seconds === null) {
    return seconds;
  }

  seconds = parseFloat(seconds);

  const negate = seconds < 0 ? '-' : '';
  seconds = Math.abs(seconds);

  if (seconds < 60) {
    return `${negate}${seconds.toFixed(places)}`;
  }
  var minutes = Math.floor(seconds / 60);
  seconds = (seconds - (60 * minutes)).toFixed(places);

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return `${negate}${minutes}:${seconds}`;
};

export const timeWithHours = (seconds) => {
  var hours = Math.floor(seconds / 3600);
  seconds -= (3600 * hours);
  var minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - (60 * minutes));
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return hours + ":" + minutes + ":" + seconds;
};
