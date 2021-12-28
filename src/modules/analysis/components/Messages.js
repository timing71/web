import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Message } from '../../../components/Message';
import { useAnalysis } from './context';

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 1fr);
  height: 100%;
`;

const MessageTableContainer = styled.div`
  height: 100%;
  overflow-y: auto;

  & table {
    width: 100%;
  }
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
      <Container>
        <MessageTableContainer>
          <table>
            <tbody>
              {
                messages.map(
                  (msg, idx) => (
                    <Message
                      key={idx}
                      message={[
                        msg.timestamp,
                        msg.category,
                        msg.message,
                        msg.style
                      ]}
                    />
                  )
                )
              }
            </tbody>
          </table>
        </MessageTableContainer>
        <FiltersContainer>
          <h3>Filters</h3>
        </FiltersContainer>
      </Container>
    );
  }
);
