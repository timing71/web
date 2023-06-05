import { Severity } from '@timing71/common';
import styled from 'styled-components';
import { ChevronRight, Info, Warning } from 'styled-icons/material';
import { useSystemMessagesContext } from '../../systemMessages';
import { Logo } from '../../../components/Logo';

const COLOURS_BY_SEVERITY = {
  [Severity.DEBUG]: 'grey',
  [Severity.WARNING]: 'yellow'
};

const ICONS_BY_SEVERITY = {
  [Severity.DEBUG]: ChevronRight,
  [Severity.INFO]: Info,
  [Severity.WARNING]: Warning
};

const DefaultIcon = (props) => (
  <Logo
    $spin
    {...props}
  />
);

const Icon = ({ severity }) => {
  const Inner = ICONS_BY_SEVERITY[severity] || DefaultIcon;
  return (
    <Inner
      size='1em'
    />
  );
};

const Message = styled.div`
  border: 1px solid;
  border-radius: 0.25em;

  background: rgba(0, 0, 0, 0.7);
  color: ${props => COLOURS_BY_SEVERITY[props.$severity] || props.theme.site.highlightColor};
  border-color: ${props => COLOURS_BY_SEVERITY[props.$severity] || props.theme.site.highlightColor};

  margin: 0.5em;
  padding: 0.5em;

  max-width: 30vw;

  text-align: right;

  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: black;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;

  align-items: flex-end;

  position: absolute;
  right: 0;
  bottom: 2.5em;
`;

const MIN_SEVERITY_TO_SHOW = process.env.NODE_ENV === 'development' ? Severity.DEBUG : Severity.INFO;

export const SystemMessages = () => {

  const { messages, removeMessage } = useSystemMessagesContext();

  const visibleMessages = messages.filter(m => m.severity >= MIN_SEVERITY_TO_SHOW);

  if (visibleMessages.length > 0) {
    return (
      <MessagesContainer>
        {
          visibleMessages.map(
            m => (
              <Message
                $severity={m.severity}
                key={m.uuid}
                onClick={() => removeMessage(m.uuid)}
              >
                <Icon severity={m.severity} />
                { m.message }
              </Message>
            )
          )
        }
      </MessagesContainer>
    );
  }
  return null;

};
