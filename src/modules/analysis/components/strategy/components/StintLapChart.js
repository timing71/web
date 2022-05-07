import { LaptimeChart } from '../../LaptimeChart';

export const StintLapChart = ({ scaleYellow, showInOut, stint }) => {

  const data = showInOut ? stint.laps : stint.relevantLaps;

  return (
    <LaptimeChart
      laps={data}
      scaleYellow={scaleYellow}
    />
  );
};
