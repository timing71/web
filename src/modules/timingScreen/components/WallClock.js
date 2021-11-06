import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Clock } from 'styled-icons/bootstrap';

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
      <Clock
        size={16}
        title='Current time'
      />
      { dayjs(date).format('HH:mm:ss') }
    </div>
  );
};
