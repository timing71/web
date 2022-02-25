import {  useTransition } from '@react-spring/web';

import { StintBox } from './StintBox';

export const CarStints = ({ height, onClick, stints, widthFunc, xFunc }) => {

  const transition = useTransition(
    stints,
    {
      from: stint => ({
        width: widthFunc(stint),
      }),
      update: stint => ({
        width: widthFunc(stint),
      })
    }
  );

  return (
    <>
      {
        transition(
          (style, stint) => (
            <StintBox
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
