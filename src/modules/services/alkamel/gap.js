const getPracticeGap = (first, second) => {
  if (first?.standing?.bestLapTime && second?.standing?.bestLapTime) {
    return Math.max(0, second.standing.bestLapTime - first.standing.bestLapTime) / 1000;
  }
  return '';
};

const getRaceGap = (first, second) => {

};

export const getGapFunction = (sessionType) => sessionType === 'RACE' ? getRaceGap : getPracticeGap;
