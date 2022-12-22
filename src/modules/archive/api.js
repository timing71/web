import { dayjs } from '@timing71/common';
import { useQuery } from "react-query";

export const API_ROOT = process.env.ARCHIVE_API_ROOT;

const fetchQuery = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};


export const useSeriesList = () => useQuery(
  'seriesList',
  () => fetchQuery(`${API_ROOT}/replays/series`)
);

export const useReplayCount = ({
  seriesFilter = '',
  descriptionFilter = '',
  yearFilter = ''
}) => {
  let queryString = `${API_ROOT}/replays/count?`;

  if (seriesFilter !== '') {
    queryString += `where[series]=${encodeURIComponent(seriesFilter)}&`;
  }

  if (descriptionFilter !== '') {
    queryString += `where[description][ilike]=${encodeURIComponent(`%${descriptionFilter}%`)}`;
  }

  if (yearFilter !== '') {
    const [start, end] = getYearRange(yearFilter);
    queryString += `&where[startTime][between][0]=${start}`;
    queryString += `&where[startTime][between][1]=${end}`;
  }

  return useQuery(
    ['replayCount', seriesFilter, descriptionFilter, yearFilter],
    () => fetchQuery(queryString)
  );
};

export const useReplayQuery = ({
  seriesFilter = '',
  descriptionFilter = '',
  yearFilter = '',
  page = 1,
  limit = 10
}) => {

  let queryString = `${API_ROOT}/replays?filter[order]=startTime%20DESC&filter[limit]=${limit}&filter[skip]=${(page - 1) * limit}`;

  if (seriesFilter !== '') {
    queryString += `&filter[where][series]=${encodeURIComponent(seriesFilter)}`;
  }

  if (descriptionFilter !== '') {
    queryString += `&filter[where][description][ilike]=${encodeURIComponent(`%${descriptionFilter}%`)}`;
  }

  if (yearFilter !== '') {
    const [start, end] = getYearRange(yearFilter);
    queryString += `&filter[where][startTime][between][0]=${start}`;
    queryString += `&filter[where][startTime][between][1]=${end}`;
  }

  return useQuery(
    ['replays', seriesFilter, descriptionFilter, yearFilter, page, limit],
    () => fetchQuery(queryString)
  );
};

const getYearRange = (year) => {
  const start = dayjs().startOf('year').year(year);
  const end = start.endOf('year');
  return [start.unix(), end.unix()];
};
