import { useState } from 'react';
import styled from 'styled-components';
import { useTransition, animated } from '@react-spring/web';
import { StintDetailTable } from './StintDetailTable';
import { StintLapChart } from './StintLapChart';
import { Button } from '../../../../../components/Button';
import { DriverName } from '../../../../../components/DriverName';

const ModalBackdrop = styled(animated.div)`

  background-color: rgba(0, 0, 0, 0.75);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

`;

const Modal = styled(animated.div)`

  position: absolute;
  top: 15vh;
  left: 5vw;
  right: 5vw;
  bottom: 15vh;

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  background-color: rgba(0, 0, 0, 0.9);

  z-index: 100;

`;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > button {
    margin: 0.5em;
  }

`;

const Heading = styled.h2`
  margin-top: 1em;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-self: stretch;

  & label input[type=checkbox] {
    margin: 0 0.5em;
  }
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  width: 100%;
  margin: 0.5em;
`;

const ModalContents = ({ close, stint }) => {

  const [showInOut, setShowInOut] = useState(false);
  const [scaleYellow, setScaleYellow] = useState(false);

  if (!stint) {
    return null;
  }

  return (
    <Container>
      <Heading>
        Car {stint.car?.raceNum} - { ' ' }
        <DriverName
          name={stint.driver?.name || 'Unknown driver'}
          rank={stint.driver?.ranking}
        />
      </Heading>
      <StintDetailTable stint={stint} />
      <Controls>
        <label>
          Show in/out laps
          <input
            checked={showInOut}
            onChange={() => setShowInOut(s => !s)}
            type='checkbox'
          />
        </label>
        <label>
          Include yellow laps in scale
          <input
            checked={scaleYellow}
            onChange={() => setScaleYellow(s => !s)}
            type='checkbox'
          />
        </label>
      </Controls>
      <ChartContainer>
        <StintLapChart
          scaleYellow={scaleYellow}
          showInOut={showInOut}
          stint={stint}
        />
      </ChartContainer>
      <Button onClick={close}>Close</Button>
    </Container>
  );
};

export const StintDetailModal = ({ close, stint }) => {

  const transition = useTransition(
    stint,
    {
      from: { opacity: 0, display: 'none' },
      enter: { opacity: 1, display: 'block' },
      leave: { opacity: 0, display: 'none' },
      config: {
        tension: 300
      }
    }
  );

  return transition(
    (style, stint) => (
      stint && (
        <>
          <ModalBackdrop
            onClick={close}
            style={style}
          />
          <Modal style={style}>
            <ModalContents
              close={close}
              stint={stint}
            />
          </Modal>
        </>
      )
    )
  );
};
