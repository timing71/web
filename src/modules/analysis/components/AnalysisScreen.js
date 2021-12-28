import styled from 'styled-components';

import { Page } from '../../../components/Page';
import { AnalysisProvider } from './context';
import { Contents } from './Contents';
import { Menu } from './Menu';


const Container = styled.div`
  display: grid;
  grid-template-areas: "title main" "flag main" "menu main";
  grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
  grid-template-rows: auto auto minmax(0, 1fr);

  height: 100vh;
`;

const Title = styled.div`
  grid-area: title;
  border-right: 1px solid ${ props => props.theme.site.highlightColor };

  padding: 0.5rem 0.25rem;
  text-align: center;

  font-size: x-large;
  font-family: ${ props => props.theme.site.headingFont };
`;

const MenuWrapper = styled.div`
  grid-area: menu;
  border-right: 1px solid ${ props => props.theme.site.highlightColor };

  overflow: hidden;
`;

export const AnalysisScreen = ({ analyser, manifest }) => {
  return (
    <Page>
      <AnalysisProvider analysis={analyser}>
        <Container>
          <Title>{manifest.name} - {manifest.description}</Title>
          <MenuWrapper>
            <Menu />
          </MenuWrapper>
          <Contents />
        </Container>
      </AnalysisProvider>
    </Page>
  );
};