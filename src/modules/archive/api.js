import { useQuery } from "react-query";

const API_ROOT = process.env.ARCHIVE_API_ROOT;

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

export const useReplayCount = (seriesFilter) => {
  let queryString = `${API_ROOT}/replays/count`;

  if (seriesFilter !== '') {
    queryString += `?where[series]=${encodeURIComponent(seriesFilter)}`;
  }
  return useQuery(
    ['replayCount', seriesFilter],
    () => fetchQuery(queryString)
  );
};

export const useReplayQuery = (seriesFilter) => {

  let queryString = `${API_ROOT}/replays?filter[order]=startTime%20DESC`;

  if (seriesFilter !== '') {
    queryString += `&filter[where][series]=${encodeURIComponent(seriesFilter)}`;
  }

  return useQuery(
    ['replays', seriesFilter],
    () => fetchQuery(queryString)
  );
};
