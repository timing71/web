import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { useSetting } from '../../../../settings';
import { DisplayMode } from '../constants';
import { CarsList } from './CarsList';
import { LapsChart } from './LapsChart';
import { TimeChart } from './TimeChart';
import { StintDetailModal } from './StintDetailModal';
import throttle from 'lodash.throttle';
import { CarOption } from '../../CarOption';
import { useAnalysis } from '../../context';
import { observer } from 'mobx-react-lite';

const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-columns: 260px minmax(0, 1fr);

  overflow: hidden;
  height: 100%;

  & h3 {
    margin: 0;
  }
`;

const ChartContainer = styled.div`
  overflow: hidden;
  grid-column: 1 / span 2;

  padding: 0.5em;

  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
`;

const CarsInnerContainer = styled.div`
  height: 100%;
  overflow-y: hidden;
  & > div {
    margin-bottom: 16px;
  }
`;

const ChartInnerContainerInner = styled.div`
  grid-column: 2;
  overflow: scroll;
  height: 100%;
`;

const ChartInnerContainer = forwardRef(
  (props, container) => {
    const prevOffsetWasFull = useRef(false);

    useEffect(
      () => {
        // Scroll fully right on first render.
        if (container.current) {
          container.current.scrollLeft = container.current.scrollWidth - container.current.clientWidth;
        }
      },
      [container]
    );

    useEffect(
      () => {
        if (container.current) {
          const div = container.current;
          const fullOffset = div.scrollWidth - div.clientWidth;
          if (prevOffsetWasFull.current && fullOffset !== div.scrollLeft) {
            div.scrollLeft = fullOffset;
          }
          prevOffsetWasFull.current = fullOffset === div.scrollLeft;

          const toggleFlag = () => {
            prevOffsetWasFull.current = fullOffset === div.scrollLeft;
          };
          div.addEventListener('scroll', toggleFlag);

          return () => {
            div.removeEventListener('scroll', toggleFlag);
          };
        }
      }
    );

    return (
      <ChartInnerContainerInner
        ref={container}
        {...props}
      />
    );
  }
);

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

  &:focus-visible {
    outline: none;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-evenly;

  & div {
    flex-grow: 1;
  }

  label {
    margin: 0 0.5em;
  }
`;

const Control = styled.div`
  display: flex;
  align-items: center;

  .rc-slider-track {
    background-color: ${ props => props.theme.site.highlightColor };
  }

  .rc-slider-rail {
    background-color: #808080;
  }

  .rc-slider-handle {
    border-color: ${ props => props.theme.site.highlightColor };
    background-color: ${ props => props.theme.site.highlightColor };
  }
`;

export const StrategyOverview = observer(
  () => {

    const analysis = useAnalysis();

    const [displayMode, setDisplayMode] = useSetting('analysis.strategy.displayMode', DisplayMode.LAPS);
    const [scale, setScale] = useState(32);
    const Chart = chartType[displayMode];

    const carPane = useRef();
    const stintPane = useRef();

    const [selectedStint, setSelectedStint] = useState(null);

    const [classFilter, setClassFilter] = useState('');

    const [window, setWindow] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

    const throttledSetWindow = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
      throttle(
        (window) => {
          setTimeout(
            () => setWindow(window),
            1
          );
        },
        10
      ),
      []
    );

    const handleStintPaneScroll = useCallback(
      (e) => {
        if (carPane.current) {
          carPane.current.scrollTop = e.target.scrollTop;
        }
        throttledSetWindow({
          left: e.target.scrollLeft,
          right: e.target.scrollLeft + e.target.clientWidth,
          top: e.target.scrollTop,
          bottom: e.target.scrollTop + e.target.clientHeight
      });
      },
      [throttledSetWindow]
    );

    useEffect(
      () => {
        if (stintPane.current) {
          handleStintPaneScroll({ target: stintPane.current });
        }
      },
      [handleStintPaneScroll]
    );

    return (
      <>
        <Helmet>
          <title>Strategy overview</title>
        </Helmet>
        <Container>
          <h3>Strategy overview</h3>
          <Controls>
            <Control>
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
            </Control>

            <Control>
              <label htmlFor='class-filter'>
                Show class:
              </label>
              <TypeSelector
                id='class-filter'
                onChange={(e) => setClassFilter(e.target.value)}
                value={classFilter}
              >
                <option value=''>All</option>
                {
                  analysis.knownCarClasses.map(
                    klass => (
                      <CarOption
                        car={{
                          classColorString: klass.toLowerCase().replace(/[-/ ]/, '')
                        }}
                        key={klass}
                        value={klass.toLowerCase().replace(/[-/ ]/, '')}
                      >
                        {klass}
                      </CarOption>
                    )
                  )
                }
              </TypeSelector>

            </Control>

            <Control>
              <label>
                Scale:
              </label>
              <Slider
                max={50}
                min={10}
                onChange={setScale}
                value={scale}
              />
            </Control>
          </Controls>
          <ChartContainer>
            <CarsInnerContainer ref={carPane}>
              <CarsList classFilter={classFilter} />
            </CarsInnerContainer>
            <ChartInnerContainer
              onScroll={handleStintPaneScroll}
              ref={stintPane}
            >
              <Chart
                classFilter={classFilter}
                containerRef={stintPane}
                scale={scale}
                showStintDetails={setSelectedStint}
                window={window}
              />
            </ChartInnerContainer>
          </ChartContainer>
          <StintDetailModal
            close={() => setSelectedStint(null)}
            stint={selectedStint}
          />
        </Container>
      </>
    );
  }
);
