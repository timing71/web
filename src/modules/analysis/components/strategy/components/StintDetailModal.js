import styled from 'styled-components';
import { useTransition, animated } from '@react-spring/web';
import { StintDetailTable } from './StintDetailTable';
import { StintLapChart } from './StintLapChart';
import { useState } from 'react';

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
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-self: stretch;

  & label input[type=checkbox] {
    margin: 0 0.5em;
  }
`;

const ModalContents = ({ close, stint }) => {

  const [showInOut, setShowInOut] = useState(false);
  const [scaleYellow, setScaleYellow] = useState(false);

  if (!stint) {
    return null;
  }

  return (
    <Container>
      <h3>
        Car {stint.car.raceNum} - { stint.driver.name }
      </h3>
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
      <div style={{ flexGrow: 1, marginBottom: '0.5em', marginTop: '0.5em', overflow: 'hidden', width: '100%' }}>
        <StintLapChart
          scaleYellow={scaleYellow}
          showInOut={showInOut}
          stint={stint}
        />
      </div>
      <button onClick={close}>Close</button>
    </Container>
  );
};

export const StintDetailModal = ({ close, stint }) => {

  const transition = useTransition(
    stint,
    {
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
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
