import { observer } from "mobx-react-lite";
import { ResponsivePie } from '@nivo/pie';

import { useAnalysis } from "../context";
import { theme } from "../../charts";
import { animated } from "@react-spring/web";
import styled from "styled-components";
import { useCallback } from "react";

const centreLabel = (label) => ({ centerX, centerY }) => (
  <text
    dominantBaseline="central"
    textAnchor="middle"
    x={centerX}
    y={centerY}
  >
    {label}
  </text>
);

const LabelRect = styled.rect`
  fill: rgba(0, 0, 0, 0.7);
  stroke: ${ props => props.theme.site.highlightColor };
`;

const Label = ({ datum, label, labelWidth, style }) => (
  <animated.g
    style={{ pointerEvents: 'none' }}
    transform={style.transform}
  >
    <LabelRect
      height={24}
      width={labelWidth}
      x={-1 * Math.floor(labelWidth / 2)}
      y={-12}
    />

    <text
      dominantBaseline="central"
      fill={style.textColor}
      style={{
        fontSize: 12,
        fontWeight: 800,
      }}
      textAnchor="middle"
    >
      {label}
    </text>
  </animated.g>
);

export const DriveShareChart = observer(
  ({ label, labelWidth, raceNum, valueFormat=(v) => v, valueFunction }) => {
    const analysis = useAnalysis();

    const drivers = analysis.cars.get(raceNum)?.drivers || [];

    const data = drivers.map(
      d => ({
        id: d.name,
        label: d.name,
        value: valueFunction(d, analysis.referenceTimestamp())
      })
    );

    const LabelComponent = useCallback(
      (props) => (
        <Label
          labelWidth={labelWidth}
          {...props}
        />
      ),
      [labelWidth]
    );

    return (
      <ResponsivePie
        arcLabelsComponent={LabelComponent}
        colors={[ '#54ffff', '#ffa600', '#008000', '#a8dc5b', '#54f8cf', '#7cec96', '#d4c523' ]}
        data={data}
        innerRadius={0.6}
        isInteractive={false}
        layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', centreLabel(label)]}
        margin={{ top: 35, bottom: 35 }}
        theme={theme}
        valueFormat={valueFormat}
      />
    );
  }
);
