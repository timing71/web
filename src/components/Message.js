import { dayjs } from '@timing71/common';
import styled from "styled-components";
import { Copy } from 'styled-icons/fa-regular';
import { MagnifyingGlass } from 'styled-icons/fa-solid';

const CategoryCell = styled.td`
  color: ${ props => (props.value && props.theme.classColours[props.value.toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
  white-space: nowrap;
`;


const Actions = styled.div`
  display: inline-flex;
  justify-content: end;
  visibility: hidden;
`;

const TextCell = styled.td`
  display: flex;
  justify-content: space-between;

  &:hover ${Actions} {
    visibility: visible;
  }

`;

const InvisibleButton = styled.button`
  background: transparent;
  border: none;
  color: white;

  &:hover {
    cursor: pointer;
    color: ${ props => props.theme.site.highlightColor };
  }
`;

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

export const Message = ({ message, setFocusedCarNum }) => {
  const [timestamp, category, text, style, carNum] = message;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${dayjs(timestamp).format('HH:mm:ss')} ${category} ${text}`);
  };

  return (
    <MessageRow msgStyle={style}>
      <td>{dayjs(timestamp).format('HH:mm:ss')}</td>
      <CategoryCell value={category}>{category}</CategoryCell>
      <TextCell>
        {text}
        <Actions>
          {
            !!carNum && !!setFocusedCarNum && (
              <InvisibleButton
                onClick={() => setFocusedCarNum(carNum)}
                title={`Focus on car ${carNum}`}
              >
                <MagnifyingGlass size='1em' />
              </InvisibleButton>
            )
          }
          <InvisibleButton
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <Copy size='1em' />
          </InvisibleButton>
        </Actions>
      </TextCell>
    </MessageRow>
  );
};
