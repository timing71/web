import { observer } from "mobx-react-lite";

import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useAnalysis } from "../context";
import dayjs from '../../../../datetime';
import { Heading, Table } from "../Table";
import { FlagCell } from '../FlagCell';

const Container = styled.div`
  height: 100vh;
  overflow-y: hidden;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  & h2 {
    grid-column: 1 / span 2;
  }

`;

const TableWrapper = styled.div`
  overflow-y: scroll;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  margin: 1em 0.25em;
`;

const StintTable = styled(Table)`

  & thead th {
    position: sticky;
    top: 0;

    background-color: black;
  }

`;

const StintHeader = styled(Heading).attrs({ colSpan: 5 })`
  padding: 0.25em;

  font-family: ${ props => props.theme.site.headingFont };

  text-align: left;
  border-bottom: 1px solid ${ props => props.theme.site.highlightColor };
  border-top: 1px solid ${ props => props.theme.site.highlightColor };
`;

const LapView = ({ lap }) => {
  return (
    <tr>
      <td>
        {lap.lapNumber}
      </td>
      <td>
        {dayjs.duration(Math.floor(lap.laptime * 1000)).format('m:ss.SSS')}
      </td>
      <td>
        {lap.driver.name}
      </td>
      <td>
        {dayjs(lap.timestamp).format('HH:mm:ss')}
      </td>
      <FlagCell flag={lap.flag} />
    </tr>
  );
};

const StintView = ({ index, stint }) => {
  return (
    <>
      <tr>
        <StintHeader>
          Stint { index + 1 } (lap {stint.startLap} – {stint.endLap})
        </StintHeader>
      </tr>
      {
        stint.laps.map(
          (l, index) => (
            <LapView
              key={index}
              lap={l}
            />
          )
        )
      }
    </>
  );
};


export const LapHistory = observer(
  ({ match: { params: { raceNum } } }) => {
    const analysis = useAnalysis();
    const car = analysis.cars.get(raceNum);

    if (!car) {
      return null;
    }

    return (
      <>
        <Helmet>
          <title>#{raceNum} — Lap history</title>
        </Helmet>
        <Container>
          <h2>#{raceNum} {car.identifyingString} — Lap history</h2>

          <TableWrapper>
            <StintTable>
              <thead>
                <tr>
                  <Heading>Lap</Heading>
                  <Heading>Time</Heading>
                  <Heading>Driver</Heading>
                  <Heading>Time of day</Heading>
                  <Heading>Flag</Heading>
                </tr>
              </thead>
              <tbody>
                {
                  car.stints.map(
                    (s, idx) => (
                      <StintView
                        index={idx}
                        key={idx}
                        stint={s}
                      />
                    )
                  )
                }
              </tbody>
            </StintTable>
          </TableWrapper>

        </Container>
      </>
    );
  }
);
