import dayjs from "dayjs";
import styled from "styled-components";

const MessageRow = styled.tr`
  & td:first-child {
    color: ${ props => props.theme.site.highlightColor }
  }
`;

const CategoryCell = styled.td`
  color: ${ props => (props.value && props.theme.classColours[props.value.toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
`;

const TextCell = styled.td`
    background: ${ props => props.msgStyle && (props.theme.messages[props.msgStyle]?.rowBackground || ['black'])[0] };

  &:nth-of-type(odd) {
    background: ${ props => props.msgStyle && (props.theme.messages[props.msgStyle]?.rowBackground || [null, 'black'])[1] };
  }

  ${
    props => (props.msgStyle && props.theme.messages[props.msgStyle]?.rowColor) && `
    & td {
      color: ${props.theme.messages[props.msgStyle].rowColor};
    }`
  }
`;

const Message = ({ message }) => {
  const [timestamp, category, text, style] = message;

  return (
    <MessageRow>
      <td>{dayjs(timestamp).format('HH:mm:ss')}</td>
      <CategoryCell value={category}>{category}</CategoryCell>
      <TextCell msgStyle={style}>{text}</TextCell>
    </MessageRow>
  );
};

const Wrapper = styled.div`
  grid-area: messages;
  border-top: 2px solid ${ props => props.theme.site.highlightColor };
  border-right: 2px solid ${ props => props.theme.site.highlightColor };

  min-height: 0;
  overflow-y: auto;
  padding: 0.25em;

`;

const MessagesTable = styled.table`
  width: 100%;
`;

export const Messages = ({ messages }) => {
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
