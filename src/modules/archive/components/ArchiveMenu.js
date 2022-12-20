import { useState } from "react";
import styled from "styled-components";

import { Option, Select } from '../../../components/Select';
import { Logo } from '../../../components/Logo';

import { useReplayCount, useReplayQuery, useSeriesList } from "../api";

import raceday from '../img/raceday.png';
import { ReplayList } from "./ReplayList";

const Inner = styled.div`

  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
  min-height: 0;
`;

const Bar = styled.div`
  padding: 1em;
  padding-bottom: 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;

  padding: 1em;
`;

const BottomBar = styled(Bar)`
  justify-content: flex-end;
  padding-top: 0.5em;
  padding-bottom: 1em;

  & img {
    margin-left: 0.5em;
  }
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  color: ${ props => props.theme.site.highlightColor };
`;

export const ArchiveMenu = () => {

  const seriesList = useSeriesList();

  const [seriesFilter, setSeriesFilter] = useState('');

  const replayCount = useReplayCount(seriesFilter);
  const replays = useReplayQuery(seriesFilter);

  return (
    <Inner>
      <Bar>
        <Select
          onChange={e => setSeriesFilter(e.target.value)}
          value={seriesFilter}
        >
          <Option value=''>Show all series</Option>
          {
            seriesList.isSuccess && seriesList.data.series.map(
              s => (
                <Option
                  key={s}
                  value={s}
                >
                  {s}
                </Option>
              )
            )
          }
        </Select>
        { replayCount.isSuccess && `${replayCount.data.count} replay${replayCount.data.count === 1 ? '' : 's'} available` }
      </Bar>
      <Content>
        {
          replays.isLoading && (
            <Loading>
              <Logo
                $spin
                size='10vw'
              />
              Loading...
            </Loading>
          )
        }
        {
          replays.isSuccess && (
            <ReplayList
              replays={replays.data || []}
            />
          )
        }
      </Content>
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
