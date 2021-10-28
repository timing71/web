import dayjs from "dayjs";
import styled from "styled-components";
import { useServiceState } from "../../../components/ServiceContext";

const CategoryCell = styled.td`
  color: ${ props => (props.value && props.theme.classColours[props.value.toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
`;

const TextCell = styled.td``;

const MessageRow = styled.tr`
  & td {
    padding: 4px;
  }

  & td:first-child {
    color: ${ props => props.theme.site.highlightColor }
  }

  & ${TextCell} {
    background: ${ props => props.msgStyle && (props.theme.messages[props.msgStyle]?.rowBackground || ['black'])[0] };
    padding: 4px 8px;

    ${
      props => (props.msgStyle && props.theme.messages[props.msgStyle]?.rowColor) && `
        color: ${props.theme.messages[props.msgStyle].rowColor};
      `
    }
  }

  &:nth-of-type(odd) ${TextCell} {
    background: ${ props => props.msgStyle && (props.theme.messages[props.msgStyle]?.rowBackground || [null, 'black'])[1] };
  }
`;

const Message = ({ message }) => {
  const [timestamp, category, text, style] = message;

  return (
    <MessageRow msgStyle={style}>
      <td>{dayjs(timestamp).format('HH:mm:ss')}</td>
      <CategoryCell value={category}>{category}</CategoryCell>
      <TextCell>{text}</TextCell>
    </MessageRow>
  );
};

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
    <Wrapper>
      <MessagesTable>
        <colgroup>
          <col style={{ width: '6em' }} />
          <col />
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
