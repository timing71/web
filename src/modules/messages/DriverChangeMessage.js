import { Stat } from "../../racing";
import { Message } from "./Message";

export const DriverChangeMessage = (se, oldCar, newCar) => {
  const oldDriver = se.get(oldCar, Stat.DRIVER);
  const newDriver = se.get(newCar, Stat.DRIVER);
  const carNum = se.get(newCar, Stat.NUM);
  const clazz = se.get(newCar, Stat.CLASS, 'Pits');

  if (!!carNum && oldDriver !== newDriver) {
    let message = '';
    if (!oldDriver) {
      message = `#${carNum} Driver change (to ${newDriver})`;
    }
    else if (!newDriver) {
      message = `#${carNum} Driver change (${oldDriver} to nobody)`;
    }
    else {
      message = `#${carNum} Driver change (${oldDriver} to ${newDriver})`;
    }

    return new Message(
      clazz,
      message,
      null,
      carNum
    );
  }
};
