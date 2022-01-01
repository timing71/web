import { useState } from 'react';
import { Helmet } from "react-helmet-async";
import styled from "styled-components";

import { DisplayMode } from '../constants';
import { LapsChart } from './LapsChart';
import { TimeChart } from './TimeChart';

const Container = styled.div`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);

  & h3 {
    margin: 0;
  }
`;

const ChartContainer = styled.div`
  overflow: auto;
  grid-column: 1 / span 2;

  padding: 0.5em;
`;

const chartType = {
  [DisplayMode.LAPS]: LapsChart,
  [DisplayMode.TIME]: TimeChart
};

const TypeSelector = styled.select`
  font-family: ${ props => props.theme.site.textFont };

  background-color: black;
  color: white;

  padding: 0.5em;

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  margin-left: 1em;

  &:focus-visible {
    outline: none;
  }
`;

export const StrategyOverview = () => {

  const [displayMode, setDisplayMode] = useState(DisplayMode.LAPS);
  const Chart = chartType[displayMode];

  return (
    <>
      <Helmet>
        <title>Strategy overview</title>
      </Helmet>
      <Container>
        <h3>Strategy overview</h3>
        <div>
          <label htmlFor='chart-type'>
            X-axis shows:
          </label>
          <TypeSelector
            id='chart-type'
            onChange={(e) => setDisplayMode(e.target.value)}
            value={displayMode}
          >
            <option value={DisplayMode.LAPS}>Laps</option>
            <option value={DisplayMode.TIME}>Time</option>
          </TypeSelector>
        </div>
        <ChartContainer>
          <Chart />
        </ChartContainer>
      </Container>
    </>
  );
};
