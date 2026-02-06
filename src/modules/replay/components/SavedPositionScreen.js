import { timeWithHours } from '@timing71/common';
import styled from 'styled-components';

import { Page } from '../../../components/Page';
import { Button } from '../../../components/Button';
import { TimeSlider } from './TimeSlider';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;

  color: ${ props => props.theme.site.highlightColor };
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
`;

const MyTimeSlider = styled(TimeSlider)`
  width: 60vw;
  margin: 1.5rem 0;
`;

const TimesWrapper = styled.div`

  display: grid;
  grid-template-columns: auto auto;

  position: relative;

  ${MyTimeSlider} {
    grid-column: 1 / span 2;
  }

  span:last-child {
    text-align: right;
  }

`;

const FloatingTime = styled.div`
  position: absolute;
  bottom: 0;
  background-color: black;
`;

const ServiceName = styled.h2`
  color: white;
  font-size: large;
  font-weight: normal;
  font-family: Verdana, monospace;
  text-align: center;
  padding: 0.5em;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: stretch;

  user-select: none;
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const SavedPositionScreen = ({ close, replay: { manifest }, replayState: { state: { duration, position }, setPosition } }) => {
  return (
    <Page>
      <Container>
        <ServiceName>{`${manifest.name} - ${manifest.description}`}</ServiceName>
        <Content>
          <h3>Continue where you left off?</h3>

          <TimesWrapper>
            <MyTimeSlider
              max={duration}
              min={0}
              value={position}
            />
            <span>0:00</span>
            <FloatingTime style={{ left: `${Math.floor(position * 100 / duration)}%` }}>{timeWithHours(position)}</FloatingTime>
            <span>{timeWithHours(duration)}</span>

          </TimesWrapper>

          <ButtonGroup>
            <Button>
              Start from beginning
            </Button>

            <Button onClick={close}>
              Continue from {timeWithHours(position)}
            </Button>
          </ButtonGroup>
        </Content>

      </Container>
    </Page>
  );
};
