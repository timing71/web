import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Stat } from '../../../../racing';
import { StatExtractor } from '../../../../statExtractor';
import { useAnalysis } from '../context';
import { Cell, Heading, Table } from '../Table';

const CarClassCell = styled(Cell).attrs(
  props => ({
    ...props,
    children: <>{props.value}</>
  })
)`
  color: ${ props => (props.value && props.theme.classColours[(props.value || '').toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
`;

const Position = styled(Cell).attrs(
  props => ({ ...props, right: true })
)`
  color: ${ props => props.theme.site.highlightColor };
`;

export const ClassLeaders = observer(
  () => {
    const analysis = useAnalysis();

    const se = new StatExtractor(analysis.manifest.colSpec);

    const leaders = {};

    analysis.state.cars.forEach(
      (car, idx) => {
        const clazz = se.get(car, Stat.CLASS);
        if (!leaders[clazz]) {
          leaders[clazz] = [idx + 1, car];
        }
      }
    );

    return (
      <Table>
        <thead>
          <tr>
            <Heading right>Overall</Heading>
            <Heading>Class</Heading>
            <Heading right>Num</Heading>
            <Heading>Team</Heading>
            <Heading>Driver</Heading>
          </tr>
        </thead>
        <tbody>
          {
            Object.values(leaders).map(
              ([position, car]) => (
                <tr key={position}>
                  <Position>{position}</Position>
                  <CarClassCell value={se.get(car, Stat.CLASS)} />
                  <Cell right>{se.get(car, Stat.NUM)}</Cell>
                  <Cell>{se.get(car, Stat.TEAM)}</Cell>
                  <Cell>{se.get(car, Stat.DRIVER)}</Cell>
                </tr>
              )
            )
          }
        </tbody>
      </Table>
    );
  }
);
