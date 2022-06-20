import styled from 'styled-components';

import { Page } from "./Page";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  color: red;
`;

export const ErrorScreen = ({ children, error }) => (
  <Page>
    <Container>
      <h3>An error has occurred:</h3>
      <p>
        { error.message }
      </p>
      { children }
    </Container>
  </Page>
);
