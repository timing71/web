import { useState } from 'react';
import styled from 'styled-components';

import { FullscreenContext, useFullscreenContext } from "../../../components/FullscreenContext";
import { Page } from '../../../components/Page';
import { AnalysisProvider } from './context';
import { Contents } from './Contents';
import { Menu } from './Menu';
import { FlagPanel } from './FlagPanel';


const ContainerDiv = styled.div`
  display: grid;
  grid-template-areas: "title main" "flag main" "menu main";
  grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
  grid-template-rows: auto auto minmax(0, 1fr);

  height: 100vh;
`;

const Container = ({ children }) => {
  const { toggle } = useFullscreenContext();

  return (
    <ContainerDiv onDoubleClick={toggle}>
      { children }
    </ContainerDiv>
  );
};

const Title = styled.div`
  grid-area: title;

  padding: 0.5rem 0.25rem;
  text-align: center;

  font-size: x-large;
  font-family: ${ props => props.theme.site.headingFont };
`;

const MenuWrapper = styled.div`
  grid-area: menu;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const AnalysisScreen = ({ analyser, children, manifest }) => {

  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <Page>
      <FullscreenContext>
        <AnalysisProvider analysis={analyser}>
          <Container>
            <Title>{manifest.name} - {manifest.description}</Title>
            <FlagPanel />
            <MenuWrapper>
              <Menu
                selectedCar={selectedCar}
                setSelectedCar={setSelectedCar}
              />
              {
                children
              }
              {
                process.env.NODE_ENV === 'development' && <div>[DEV]</div>
              }
            </MenuWrapper>
            <Contents selectedCar={selectedCar} />
          </Container>
        </AnalysisProvider>
      </FullscreenContext>
    </Page>
  );
};
