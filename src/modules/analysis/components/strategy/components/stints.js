import { animated, useTransition } from '@react-spring/web';
import { useMotionConfig } from '@nivo/core';

import { StintBox as SB } from './StintBox';

export const CarStints = ({ height, onClick, stints, widthFunc, xFunc }) => {

  const { animate, config: springConfig } = useMotionConfig();

  const transition = useTransition(
    stints,
    {
      from: stint => ({
        width: widthFunc(stint),
      }),
      update: stint => ({
        width: widthFunc(stint),
      }),
      config: springConfig,
      immediate: !animate
    }
  );

  return (
    <>
      {
        transition(
          (style, stint) => (
            <SB
              height={height}
              onClick={onClick}
              stint={stint}
              x={xFunc(stint)}
              {...style}
            />
          )
        )
      }
    </>
  );
};

export const StintsLayer = ({ bars, onClick, widthFunc, xFunc }) => {

  const { animate, config: springConfig } = useMotionConfig();

  const yPosTransition = useTransition(
    bars,
    {
      keys: bar => bar.key,
      from: bar => ({
        transform: `translate(0, ${bar.y})`,
      }),
      update: bar => ({
        transform: `translate(0, ${bar.y})`
      }),
      config: springConfig,
      immediate: !animate
    }
  );

  return (
    <g
      className='stints-layer'
    >
      {
        yPosTransition(
          (style, bar) => {
            const car = bar.data.data;
            return (
              <animated.g
                key={bar.key}
                {...style}
              >
                <CarStints
                  height={bar.height}
                  onClick={onClick}
                  stints={car.stints}
                  widthFunc={widthFunc}
                  xFunc={xFunc}
                />
              </animated.g>
            );
          }
        )
      }
    </g>
  );
};
