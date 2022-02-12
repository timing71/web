import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useAnalysis } from "../context";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const DriverStints = observer(
  ({ match: { params: { raceNum } } }) => {
    const analysis = useAnalysis();
    const car = analysis.cars.get(raceNum);

    return (
      <Container>
        <h3>Driver stints: #{raceNum} - {car?.identifyingString}</h3>
      </Container>
    );
  }
);
