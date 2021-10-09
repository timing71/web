const getPracticeGap = (first, second) => {
  if (first?.bestLapTime && second?.bestLapTime) {
    return Math.max(0, second.bestLapTime - first.bestLapTime) / 1000;
  }
  return '';
};

const e = (e, t, a, n) => {
  if (t < n) {
    if (t < 0) {
      return a['currentLapStartTime'];
    } else if (a['currentLoops'].t) {
      return a['currentLapStartTime'] + a['currentLoops'][t];
    }
    else {
      return a['currentLapStartTime'];
    }
  }
  else if (t > n) {
    if (a['previousLoops'].length === 0) {
      return a['currentLapStartTime'];
    } else {
      const finalLoopIndex = Math.max(...Object.keys(a['previousLoops']));
      return a['currentLapStartTime'] - a['previousLoops'][finalLoopIndex] + (a['previousLoops'].t || 0);
    }
  } else if (t < 0) {
    return a['currentLapStartTime'];
  }
  else {
    return a['currentLapStartTime'] + (a['currentLoops'].t || 0);
  }
};

const pluralize = (num, str) => `${num} ${str}${num === 1 ? '' : 's'}`;

const getRaceGap = (first, second) => {

  if (!first || !second || !second.isRunning) {
    return '';
  }
  if (!second.currentLapStartTime && (second.currentLoops || []).length === 0) {
    return '';
  }


  let n;
  if ((second.currentLapNumber || -1) >= 0) {
    n = first.currentLapNumber - second.currentLapNumber;
  }
  else {
    n = first.laps - second.laps;
  }

  const secondLatestLoop = Math.max(...Object.keys(second['currentLoops']), 0);
  const secondPassingTime = second['currentLapStartTime'] + (secondLatestLoop < 0 ? 0 : (second['currentLoops'][secondLatestLoop] || 0));
  const firstLatestLoop = Math.max(...Object.keys(first['currentLoops']), 0);
  const ell = e(second, secondLatestLoop, first, firstLatestLoop);

  if (n > 1) {
    if (secondLatestLoop > firstLatestLoop) {
      return pluralize(n - 1, 'lap');
    }
    else if (firstLatestLoop < secondLatestLoop) {
      return pluralize(n, 'lap');
    }
    else {
      if (ell < secondPassingTime) {
        return pluralize(n, 'lap');
      }
      else {
        return pluralize(n - 1, 'lap');
      }
    }
  }
  else if (n === 1) {
    if (firstLatestLoop > secondLatestLoop) {
      return pluralize(n, 'lap');
    }
    else if (firstLatestLoop < secondLatestLoop) {
      return Math.abs(secondPassingTime - ell) / 1000.0;
    }
    else if (ell < secondPassingTime) {
      return pluralize(n, 'lap');
    }
    else {
      const maxKey = Math.max(...Object.keys(first['previousLoops']), -1);
      let ell2 = first['currentLapStartTime'] - (maxKey >= 0 ? first['previousLoops'][maxKey] : 0);
      if (secondLatestLoop >= 0) {
        ell2 += first['previousLoops'].i || 0;
      }
      return Math.abs(secondPassingTime - ell2) / 1000.0;
    }
  }
  else {
    return Math.abs(secondPassingTime - ell) / 1000.0;
  }

};

export const getGapFunction = (sessionType) => sessionType === 'RACE' ? getRaceGap : getPracticeGap;
