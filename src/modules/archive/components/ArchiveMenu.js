import styled from "styled-components";

import raceday from '../img/raceday.png';

const Inner = styled.div`

  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
`;

const Bar = styled.div`
  padding: 1em;
`;

const Content = styled.div`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;

  padding: 1em;
`;

const BottomBar = styled(Bar)`

  display: flex;
  justify-content: flex-end;
  align-items: center;

  & img {
    margin-left: 0.5em;
  }
`;

export const ArchiveMenu = () => {
  return (
    <Inner>
      <Bar>
        Hello
      </Bar>
      <Content>Content</Content>
      <BottomBar>
        In partnership with
        <a
          href="https://raceday.watch/"
          rel="noreferrer"
          target="_blank"
        >
          <img
            alt='RaceDay.watch'
            src={raceday}
          />
        </a>
      </BottomBar>
    </Inner>
  );
};
