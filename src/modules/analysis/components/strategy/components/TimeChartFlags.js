import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { FlagState } from "../../../../../racing";

import { useAnalysis } from "../../context";
import { FlagRect } from "../../FlagRect";
import { HEADER_HEIGHT } from "../constants";

const MyFlagRect = styled(FlagRect)`
  opacity: 0.75;
`;

export const TimeChartFlags = observer(
  ({ height, widthFunc, xFunc }) => {
    const analysis = useAnalysis();
    const flags = analysis.session.flagStats;

    return (
      <g className='flags'>
        {
          flags.map(
            ({ endTime, flag, startTime }, idx) => (
              flag !== FlagState.GREEN && (
                <MyFlagRect
                  flag={flag}
                  height={height}
                  key={idx}
                  width={widthFunc({ startTime, durationSeconds: ((endTime || 0) - startTime) / 1000, inProgress: !endTime })}
                  x={xFunc({ startTime })}
                  y={HEADER_HEIGHT}
                />
              )
            )
          )
        }
      </g>
    );
  }
);
