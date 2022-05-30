import { createContext, useContext, useState } from 'react';
import styled from 'styled-components';

export const SystemMessageContext = createContext();

export const SystemMessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  return (
    <SystemMessageContext.Provider value={{ message, setMessage }}>
      { children }
    </SystemMessageContext.Provider>
  );
};

const Message = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > img, & > svg {
    width: 24px;
    height: 24px;
  }

`;

export const SystemMessage = () => {

  const { message } = useContext(SystemMessageContext);

  if (message) {
    return (
      <Message>
        {message}
      </Message>
    );
  }
  return null;

};
