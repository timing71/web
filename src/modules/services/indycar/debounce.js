const MIN_OUT_TIME = 30000;

export class Debouncer {
  /*
    IndyCar's live timing has a tendency to "bounce" cars in and out of the pits.
    A car will be shown as leaving the pits, then back in the pits in the next
    update, then back out in the subsequent update - in reality it left the first
    time and remains on track.

    We try to avoid this by ignoring any cars marked as "PIT" until MIN_OUT_TIME
    (30 seconds) after they first are marked as "RUN". It's not perfect but it
    might do the job.
  */
  constructor() {
    this._outTime = {};
  }

  debounce(carNum, newState) {

    const now = Date.now();
    if (newState === 'PIT' && this._outTime[carNum]) {
      if (this._outTime[carNum] + MIN_OUT_TIME <= now) {
        delete this._outTime[carNum];
        return 'PIT';
      }
      else {
        return 'RUN';
      }
    }
    else if (newState === 'RUN' && !this._outTime[carNum]) {
      this._outTime[carNum] = now;
    }

    return newState;
  }
}
