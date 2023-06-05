import { useTransition, animated } from '@react-spring/web';
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

const MessageInner = styled(animated.div)`
  border: 1px solid;
  border-radius: 0.25em;

  background: rgba(32, 32, 32, 0.9);
  color: ${props => COLOURS_BY_SEVERITY[props.$severity] || props.theme.site.highlightColor};
  border-color: ${props => COLOURS_BY_SEVERITY[props.$severity] || props.theme.site.highlightColor};

  margin: 0.5em;
  padding: 0.5em;

  max-width: 30vw;

  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: #202020;
  }

  display: grid;
  grid-template-columns: auto 1fr;

  & > h4 {
    margin-top: 0;
    margin-bottom: 0.25em;
    grid-column: 2;
  }

  & > p {
    margin: 0;
    grid-column: 2;
  }

  & > div, & > svg {
    align-self: center;
  }
`;

const Message = ({ message, ...props }) => {
  return (
    <MessageInner
      $severity={message.severity}
      {...props}
    >
      <Icon severity={message.severity} />
      { message.title && ( <h4>{message.title}</h4> ) }
      <p>
        { message.message }
      </p>
    </MessageInner>
  );
};

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

  const transitions = useTransition(visibleMessages, {
    from: { opacity: 0, x: 250 },
    enter: { opacity: 1, x: 0 },
    leave: { opacity: 0, x: 0 }
  });

  return (
    <MessagesContainer>
      {
        transitions(
          (style, m) => (
            <Message
              message={m}
              onClick={() => removeMessage(m.uuid)}
              style={style}
            />
          )
        )
      }
    </MessagesContainer>
  );

};
