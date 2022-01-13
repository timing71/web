import dayjs from "dayjs";
import styled from "styled-components";

const CategoryCell = styled.td`
  color: ${ props => (props.value && props.theme.classColours[props.value.toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
`;

const TextCell = styled.td``;

const MessageRow = styled.tr`
  & td {
    padding: 4px;
    vertical-align: top;
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

export const Message = ({ message }) => {
  const [timestamp, category, text, style] = message;

  return (
    <MessageRow msgStyle={style}>
      <td>{dayjs(timestamp).format('HH:mm:ss')}</td>
      <CategoryCell value={category}>{category}</CategoryCell>
      <TextCell>{text}</TextCell>
    </MessageRow>
  );
};
