import { observer } from 'mobx-react-lite';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

import { useAnalysis } from './context';
import { MessagesList } from './MessagesList';

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  height: 100%;
`;

export const CarMessages = observer(
  ({ match: { params: { raceNum } } }) => {

    const analysis = useAnalysis();

    const messages = analysis.messages.messages.filter(m => m.carNum === raceNum);

    return (
      <>
        <Helmet>
          <title>Messages</title>
        </Helmet>
        <Container>
          <MessagesList messages={messages} />
        </Container>
      </>
    );
  }
);
