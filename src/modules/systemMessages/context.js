import { createContext, useContext, useState } from 'react';
import { v4 } from 'uuid';

export const SystemMessagesContext = createContext({
  messages: [],
  addMessage: () => {},
  removeMessage: () => {}
});

export const SystemMessagesProvider = ({ children }) => {

  const [systemMessages, setSystemMessages] = useState([]);

  const addSystemMessage = (msg) => {

    if (!msg.uuid) {
      msg.uuid = v4();
    }

    setSystemMessages(prev => [...prev, msg]);

    if (msg.timeout) {
      setTimeout(
        () => removeSystemMessage(msg.uuid),
        msg.timeout
      );
    }

    return msg.uuid;
  };

  const removeSystemMessage = (uuid) => {
    setSystemMessages(prev => prev.filter(m => m.uuid !== uuid));
  };

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
