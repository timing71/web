import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useAnalysis } from '../context';

const OUTER_RADIUS = 100;
const RADIUS_STEP = 15;
const MAX_LEVELS = 3;

const Wrapper = styled.svg`
  & .base {
    stroke: #808080;
    stroke-width: 1px;
  }

  text.base {
    stroke: none;
    fill: #A0A0A0;
  }

  text {
    fill: white;
    font-size: 4px;
  }

  .lap-marker {
    stroke-width: 0.5px;
  }

  .car {
    .central {
      visibility: hidden;
    }

    circle {
      stroke: black;
      stroke-width: 0.2px;
      fill: #808080;
    }

    &.leader {
      circle {
        stroke: yellow;
        stroke-width: 0.5px;
        z-index: 200;
      }
      line {
        stroke: yellow;
      }
    }

    text {
      alignment-baseline: central;
      text-anchor: middle;
      font-size: 5px;
      user-select: none;
    }

    &.selected {
      circle {
        stroke: ${props => props.theme.site.highlightColor};
        stroke-width: 0.5px;
      }
      line {
        stroke: ${props => props.theme.site.highlightColor};
        visibility: visible;
      }
    }

    line {
      visibility: hidden;
      stroke: #606060;
      stroke-width: 0.5px;
    }

    &:hover {
      cursor: pointer;
      line, .central {
        visibility: visible;
      }
    }
  }
`;

export const Ring = ({ r, caption }) => (
  <>
    <circle
      className="base"
      cx={0}
      cy={0}
      r={r}
    />
    {
      caption && (
        <g>
          <line
            className="base lap-marker"
            x1={0}
            x2={25}
            y1={-r}
            y2={-r}
          />
          <text
            className='base'
            x={26}
            y={-r + 1}
          >
            {caption}
          </text>
        </g>
      )
    }
  </>
);

export const BaseLayer = ({ leaderLap, numberOfRings = MAX_LEVELS }) => {
  return (
    <g>
      {
        [...Array(numberOfRings).keys()].map(
          level => (
            <Ring
              caption={numberOfRings === 1 ? undefined : (level < numberOfRings - 1) ? `Lap ${leaderLap - level}` : 'Others'}
              key={level}
              r={OUTER_RADIUS - (level * RADIUS_STEP)}
            />
          )
        )
      }

      <line
        className="base"
        x1={0}
        x2={0}
        y1={0}
        y2={-OUTER_RADIUS - 10}
      />
      <line
        className="base"
        markerEnd="url(#arrow)"
        strokeLinecap='square'
        x1={0}
        x2={10}
        y1={-OUTER_RADIUS - 10}
        y2={-OUTER_RADIUS - 10}
      />
    </g>
  );
};


const CarPosition = ({ isLeader, raceNum, ringIndex, relativeDistance }) => {
  const minRadius = OUTER_RADIUS - (MAX_LEVELS - 1) * RADIUS_STEP;
  const radius = Math.max(minRadius, OUTER_RADIUS - (ringIndex * RADIUS_STEP));
  const angle = 2 * Math.PI * relativeDistance;

  const xPos = Math.sin(angle) * -radius;
  const yPos = Math.cos(angle) * -radius;

  return (
    <g className={`car ${ isLeader ? 'leader' : '' }`}>
      <line
        strokeLinecap='square'
        x1={0}
        x2={Math.sin(angle) * -OUTER_RADIUS}
        y1={0}
        y2={Math.cos(angle) * -OUTER_RADIUS}
      />
      <circle
        cx={xPos}
        cy={yPos}
        r={6}
      />
      <text
        x={xPos}
        y={yPos}
      >
        {raceNum}
      </text>
      <g className='central'>
        <circle
          cx={0}
          cy={0}
          r={6}
        />
        <text>{raceNum}</text>
      </g>
    </g>
  );
};

const CarsLayer = ({ cars, leaderLap, useLaps }) => {
  return (
    <g>
      {
        cars.slice(1).filter(c => !!c.position).map(
          (car, idx) => (
            <CarPosition
              key={car.raceNum}
              raceNum={car.raceNum}
              relativeDistance={car.position.relativeDistance}
              ringIndex={useLaps ? leaderLap - car.currentLap : 0}
            />
          )
        )
      }
      <CarPosition
        isLeader
        raceNum={cars[0].raceNum}
        relativeDistance={cars[0].position.relativeDistance}
        ringIndex={0}
      />
    </g>
  );
};

export const RadarChart = observer(
  ({ useLaps }) => {

    const analysis = useAnalysis();

    return (
      <Wrapper
        viewBox='-120 -120 240 240'
      >
        <defs>
          <marker
            id="arrow"
            markerHeight="6"
            markerUnits="strokeWidth"
            markerWidth="10"
            orient="auto"
            refX="0"
            refY="3"
            viewBox="0 0 15 15"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#A0A0A0"
            />
          </marker>
        </defs>
        <BaseLayer
          leaderLap={analysis.session.leaderLap}
          numberOfRings={useLaps ? MAX_LEVELS : 1}
        />
        <CarsLayer
          cars={analysis.carsInRunningOrder}
          leaderLap={analysis.session.leaderLap}
          useLaps={useLaps}
        />
      </Wrapper>
    );
  }
);
