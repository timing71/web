import dayjs from "dayjs";
import styled from "styled-components";
import { useServiceState } from "../../../components/ServiceContext";

const Inner = styled.div`
  grid-area: data;

  padding-bottom: 2.5em;
`;

export const DataPanel = () => {

  const { state } = useServiceState();

  return (
    <Inner>
      <p>Last updated: {dayjs(state.lastUpdated).format("HH:mm:ss")}</p>
    </Inner>
  );
};
