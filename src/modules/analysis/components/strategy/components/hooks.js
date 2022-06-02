import { useTransition } from "@react-spring/web";
import { ROW_HEIGHT, ROW_PADDING } from "../constants";

export const useYPosTransition = (cars) => {
  return useTransition(
    cars,
    {
      keys: car => car.raceNum,
      from: (car, index) => ({
        transform: `translate(0, ${(index * ROW_HEIGHT) + ROW_PADDING }px)`
      }),
      update: (car, index) => ({
        transform: `translate(0, ${(index * ROW_HEIGHT) + ROW_PADDING }px)`
      })
    }
  );
};
