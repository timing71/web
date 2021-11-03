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
    if (oldLastLap[1] !== 'pb' && newLastLap[1] === 'pb') {
      return new Message(
        clazz,
        `#${carNum}${driverText} set a new personal best (${timeInSeconds(newLastLap[0])})`,
        'pb',
        carNum
      );
    }
    else if (oldLastLap[1] !== 'sb' && (newLastLap[1] === 'sb' || newLastLap[1] === 'sb-new')) {
      return new Message(
        clazz,
        `#${carNum}${driverText} set a new overall best (${timeInSeconds(newLastLap[0])})`,
        'sb',
        carNum
      );
    }
  }
};
