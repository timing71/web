import { Stat } from "../../racing";
import { timeInSeconds } from '../../formats';
import { Message } from "./Message";

export const FastLapMessage = (se, oldCar, newCar) => {
  const oldLastLap = se.get(oldCar, Stat.LAST_LAP);
  const newLastLap = se.get(newCar, Stat.LAST_LAP);
  const carNum = se.get(newCar, Stat.NUM);
  const clazz = se.get(newCar, Stat.CLASS, 'Pits');

  if (oldLastLap !== newLastLap) {
    const driver = se.get(newCar, Stat.DRIVER);
    const driverText = driver ? ` (${driver})` : '';
    //const newBestLap = se.get(newCar, Stat.BEST_LAP);
    if (
      newLastLap[1] === 'pb' &&
      (oldLastLap[1] !== 'pb' || oldLastLap[0] !== newLastLap[0]) &&
      !((oldLastLap[1] === 'sb' || oldLastLap[1] === 'sb-new' ) && newLastLap[1] === 'pb' && oldLastLap[0] === newLastLap[0])
    ) {
      return new Message(
        clazz,
        `#${carNum}${driverText} set a new personal best (${timeInSeconds(newLastLap[0])})`,
        'pb',
        carNum
      );
    }
    else if (
      (newLastLap[1] === 'sb' || newLastLap[1] === 'sb-new') &&
      (
        (oldLastLap[1] !== newLastLap[1] && oldLastLap[1] !== 'sb-new') ||
        oldLastLap[0] !== newLastLap[0]
      )
    ) {
      return new Message(
        clazz,
        `#${carNum}${driverText} set a new overall best (${timeInSeconds(newLastLap[0])})`,
        'sb',
        carNum
      );
    }
  }
};
