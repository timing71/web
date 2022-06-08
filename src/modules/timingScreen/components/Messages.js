import styled from "styled-components";
import { useServiceState } from "../../../components/ServiceContext";
import { Message } from "../../../components/Message";
import { stopEventBubble } from "../../../utils";

const Wrapper = styled.div`
  grid-area: messages;
  border-top: 2px solid ${ props => props.theme.site.highlightColor };

  min-height: 0;
  overflow-y: auto;
  padding: 0;

`;

const MessagesTable = styled.table`
  width: 100%;
  border-spacing: 1px;
`;

export const Messages = () => {

  const { state: { messages } } = useServiceState();

  return (
    <Wrapper
      onDoubleClick={stopEventBubble()}
    >
      <MessagesTable>
        <colgroup>
          <col style={{ width: '6em' }} />
          <col style={{ width: '8em' }} />
          <col />
        </colgroup>
        <tbody>
          {
            messages.map(
              (m, idx) => (
                <Message
                  key={idx}
                  message={m}
                />
              )
            )
          }
        </tbody>
      </MessagesTable>
    </Wrapper>
  );
};
