import { useCallback, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import styled from "styled-components";

import { Input, Option, Select } from '../../../components/Forms';
import { Logo } from '../../../components/Logo';

import { useReplayCount, useReplayQuery, useSeriesList } from "../api";

import raceday from '../img/raceday.png';
import { ReplayList } from "./ReplayList";
import { YearSelection } from "./YearSelection";

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

  & > input {
    flex: 1 1 auto;
    width: 0;
    margin-bottom: 0.5em;
  }

  & > span {
    margin-bottom: 0.5em;
  }
`;

const SeriesSelect = styled(Select)`
  flex: 1 1 auto;
  width: 0;
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

  const params = useParams();
  const history = useHistory();

  const seriesList = useSeriesList();

  const seriesFilter = params.series || '';
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [debouncedDescriptionFilter] = useDebounce(descriptionFilter, 250);

  const replayCount = useReplayCount(seriesFilter, debouncedDescriptionFilter, yearFilter);
  const replays = useReplayQuery(seriesFilter, debouncedDescriptionFilter, yearFilter);

  const setSeriesFilter = useCallback(
    (newFilter) => {
      history.push(`/archive/${encodeURIComponent(newFilter)}`);
    },
    [history]
  );

  return (
    <Inner>
      <Bar>
        <SeriesSelect
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
        </SeriesSelect>
        <YearSelection
          onChange={(e) => setYearFilter(e.target.value)}
          value={yearFilter}
        />
        <Input
          onChange={(e) => setDescriptionFilter(e.target.value)}
          placeholder='Search descriptions...'
          value={descriptionFilter}
        />
        <span>
          { replayCount.isSuccess && `${replayCount.data.count} replay${replayCount.data.count === 1 ? '' : 's'} available` }
        </span>
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
