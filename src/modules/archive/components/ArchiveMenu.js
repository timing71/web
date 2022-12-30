import { useCallback, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import styled from "styled-components";

import { Input, Option, Select } from '../../../components/Forms';
import { Logo } from '../../../components/Logo';

import { useReplayCount, useReplayQuery, useSeriesList } from "../api";

import raceday from '../img/raceday.png';
import { ReplayList } from "./ReplayList";
import { YearSelection } from "./YearSelection";
import { useMemo } from "react";
import { Paginator } from "../../../components/Paginator";

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
  justify-content: space-between;
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

const Partner = styled.div`
  display: flex;
  align-items: center;
`;

const PAGE_SIZE = 24;

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export const ArchiveMenu = () => {

  const params = useParams();
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();

  const seriesList = useSeriesList();

  const seriesFilter = params.series || '';
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [debouncedDescriptionFilter] = useDebounce(descriptionFilter, 250);

  const replayCount = useReplayCount({
    seriesFilter,
    descriptionFilter: debouncedDescriptionFilter,
    yearFilter
  });

  const pages = useMemo(
    () => Math.ceil((replayCount.data?.count || 0) / PAGE_SIZE) || 0,
    [replayCount.data]
  );

  const page = Math.max(
    1,
    Math.min(
      parseInt(query.get('page'), 10) || 1,
      pages
    )
  );

  const replays = useReplayQuery({
    seriesFilter,
    descriptionFilter: debouncedDescriptionFilter,
    yearFilter,
    page,
    limit: PAGE_SIZE
  });

  const setSeriesFilter = useCallback(
    (newFilter) => {
      history.push(`/archive/${encodeURIComponent(newFilter)}`);
    },
    [history]
  );

  const seekPage = useCallback(
    (pageNum) => {
      const params = new URLSearchParams(location.search);
      params.set('page', pageNum);
      history.replace({ pathname: location.pathname, search: params.toString() });
    },
    [history, location.pathname, location.search]
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
        <Paginator
          page={page}
          pages={pages}
          seekPage={seekPage}
        />
        <Partner>
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
        </Partner>
      </BottomBar>
    </Inner>
  );
};
