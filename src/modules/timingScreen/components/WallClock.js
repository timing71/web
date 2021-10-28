import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const WallClock = () => {
  const [ date, setDate ] = useState(Date.now());

  useEffect(
    () => {
      const interval = window.setInterval(
        () => setDate(Date.now()),
        100
      );

      return () => {
        window.clearInterval(interval);
      };
    }
  );

  return (
    <div>
      { dayjs(date).format('HH:mm:ss') }
    </div>
  );
};
