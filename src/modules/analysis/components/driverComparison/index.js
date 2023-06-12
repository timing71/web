import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet-async";
import styled from 'styled-components';
import { Controls } from '../Controls';
import { useState } from 'react';
import { ClassFilter } from '../ClassFilter';
import { DriverComparisonChart } from "./DriverComparisonChart";
import { WidthResponsiveWrapper } from "../WidthResponsiveWrapper";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const DriverComparison = observer(
  () => {

    const [classFilter, setClassFilter] = useState('');

    return (
      <>
        <Helmet>
          <title>Driver comparison</title>
        </Helmet>
        <Container>
          <Controls>
            <h3>Driver comparison</h3>
            <ClassFilter
              onChange={(e) => setClassFilter(e.target.value)}
              value={classFilter}
            />
          </Controls>
          <ChartContainer>
            <WidthResponsiveWrapper>
              {
                ({ width }) => (
                  <DriverComparisonChart
                    classFilter={classFilter}
                    width={width}
                  />
                )
              }
            </WidthResponsiveWrapper>
          </ChartContainer>
        </Container>
      </>
    );
  }
);
