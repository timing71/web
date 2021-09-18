export const timeInSeconds = (seconds, places=3) => {
  if (isNaN(seconds) || seconds === '') {
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
