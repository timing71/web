import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useAnalysis } from '../context';
import { Cell, Heading, Row, Table } from '../Table';

const StateRow = styled.tr`
  background: ${ props => (props.theme.carStates[props.state]?.rowBackground || ['black'])[0] };
  font-style: ${ props => (props.theme.carStates[props.state]?.rowStyle || 'normal')};

  &:nth-of-type(odd) {
    background: ${ props => ((props.theme.carStates[props.state]?.rowBackground || [null, '#202020'])[1]) || '#202020' };
  }

  ${
    props => (props.carState && props.theme.carStates[props.state]?.rowColor) && `
    & td {
      color: ${props.theme.carStates[props.state].rowColor};
    }`
  }

`;

const CarStateCell = styled.td`
  color: ${ props => (props.value && props.theme.carStates[props.value]?.color) || 'white' };
  background: ${ props => (props.value && props.theme.carStates[props.value]?.background) || 'transparent' };
`;

export const CarsPerState = observer(
  () => {
    const analysis = useAnalysis();
    const counts = Object.entries(analysis.cars.perState).sort((a, b) => b[1] - a[1]);
    return (
      <Table>
        <thead>
          <tr>
            <Heading>State</Heading>
            <Heading right>Count</Heading>
          </tr>
        </thead>
        <tbody>
          {
            counts.map(
              ([state, count]) => (
                <StateRow
                  key={state}
                  state={state}
                >
                  <CarStateCell value={state}>{state}</CarStateCell>
                  <Cell right>{count}</Cell>
                </StateRow>
              )
            )
          }
          <Row footer>
            <Heading>Total</Heading>
            <Heading right>{ Object.values(analysis.cars.perState).reduce((sum, c) => sum + c, 0) }</Heading>
          </Row>
        </tbody>
      </Table>
    );
  }
);
