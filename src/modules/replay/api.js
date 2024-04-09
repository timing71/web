import { useQuery } from "react-query";

export const API_ROOT = process.env.DVR_API_ROOT || 'https://dvr.timing71.org';

const fetchQuery = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const useUpcomingQuery = (limit=10) => {

  let queryString = `${API_ROOT}/sessions?perPage=${limit}`;

  return useQuery(
    ['upcomingSessions', limit],
    () => fetchQuery(queryString),
    {
      refetchInterval: 60000
    }
  );
};
