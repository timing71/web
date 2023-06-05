import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

export const SystemMessagesContext = createContext({
  messages: [],
  addMessage: () => {},
  removeMessage: () => {}
});

export const SystemMessagesProvider = ({ children }) => {

  const [systemMessages, setSystemMessages] = useState([]);
  const timeouts = useRef({});

  const addSystemMessage = (msg) => {

    if (!msg.uuid) {
      msg.uuid = v4();
    }

    setSystemMessages(prev => [...prev, msg]);

    if (msg.timeout) {
      const timeout = setTimeout(
        () => {
          removeSystemMessage(msg.uuid);
          delete timeouts.current[msg.uuid];
        },
        msg.timeout
      );
      timeouts.current[msg.uuid] = timeout;
    }

    return msg.uuid;
  };

  const removeSystemMessage = (uuid) => {
    setSystemMessages(prev => prev.filter(m => m.uuid !== uuid));
  };

  useEffect(
    () => () => {
      Object.values(timeouts.current).forEach(
        t => clearTimeout(t)
      );
    },
    []
  );

  return (
    <SystemMessagesContext.Provider
      value={{
        messages: systemMessages,
        addMessage: addSystemMessage,
        removeMessage: removeSystemMessage
      }}
    >
      { children }
    </SystemMessagesContext.Provider>
  );
};

export const useSystemMessagesContext = () => useContext(SystemMessagesContext);
