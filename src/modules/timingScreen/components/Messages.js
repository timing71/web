import styled from "styled-components";
import { useServiceState } from "../../../components/ServiceContext";
import { Message } from "../../../components/Message";
import { stopEventBubble } from "../../../utils";
import { useFocusedCarContext } from '../context';

const Wrapper = styled.div`
  grid-area: messages;
  border-top: 2px solid ${ props => props.theme.site.highlightColor };

  min-height: 0;
  overflow-y: scroll;
  padding: 0;

`;

const MessagesTable = styled.table`
  width: 100%;
  border-spacing: 1px;
`;

export const Messages = () => {

  const { state } = useServiceState();
  const { setFocusedCarNum } = useFocusedCarContext();

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
            (state?.messages || []).map(
              (m, idx) => (
                <Message
                  key={idx}
                  message={m}
                  setFocusedCarNum={setFocusedCarNum}
                />
              )
            )
          }
        </tbody>
      </MessagesTable>
    </Wrapper>
  );
};
