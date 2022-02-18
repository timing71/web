import { observer } from 'mobx-react-lite';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import { useAnalysis } from './context';
import { MessagesList } from './MessagesList';

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
`;

const FiltersContainer = styled.div`
  padding: 0.5em;

  & h3 {
    margin-top: 0;
  }
`;

export const Messages = observer(
  () => {

    const analysis = useAnalysis();

    const messages = analysis.messages.messages;

    return (
      <>
        <Helmet>
          <title>Messages</title>
        </Helmet>
        <Container>
          <MessagesList messages={messages} />
          <FiltersContainer>
            <h3>Filters</h3>
          </FiltersContainer>
        </Container>
      </>
    );
  }
);
