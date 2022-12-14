import styled from "styled-components";
import { dayjs, timeWithHours } from '@timing71/common';

const Inner = styled.div`
  border: 1px solid green;
  border-radius: 0.25em;
  display: flex;
  flex-direction: column;

  background-color: #292929;
`;

const Series = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  background-color: green;
  padding: 0.5em;
  align-self: flex-start;

  border-bottom-right-radius: 0.25em;
`;

const Description = styled.div`
  flex-grow: 1;
  padding: 0.5em;
`;

const BottomRow = styled.div`
  justify-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Duration = styled.div`
  background-color: #404040;
  color: white;
  padding: 0.5em;
  font-size: small;

  &:first-child {
    border-bottom-left-radius: 0.25em;
    border-top-right-radius: 0.25em;
  }

  &:last-child {
    border-bottom-right-radius: 0.25em;
    border-top-left-radius: 0.25em;
  }
`;

export const Replay = ({ replay }) => {
  return (
    <Inner>
      <Series>{replay.series}</Series>
      <Description>
        {replay.description}
      </Description>
      <BottomRow>
        <Duration>
          {dayjs(replay.startTime * 1000).format('D MMM YYYY')}
        </Duration>
        <Duration>
          { timeWithHours(replay.duration) }
        </Duration>
      </BottomRow>
    </Inner>
  );
};
