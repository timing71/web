import { Helmet } from "react-helmet-async";
import styled from "styled-components";

const Container = styled.div`

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));

  height: 100%;

`;

export const SessionStats = () => {
  return (
    <>
      <Helmet>
        <title>Session statistics</title>
      </Helmet>
      <Container>
        <div>AAA</div>
        <div>BBB</div>
        <div>CCC</div>
        <div>DDD</div>
      </Container>
    </>
  );
};
