import { types } from 'mobx-state-tree';

import { Message as CTFMessage } from '@timing71/common/messages';

export const Message = types.model({
  category: types.optional(types.string, ''),
  message: types.string,
  style: types.union(types.string, types.undefined, types.null),
  carNum: types.union(types.string, types.undefined, types.null),
  timestamp: types.Date
});

export const Messages = types.model({
  messages: types.array(Message)
}).actions(
  self => ({
    update(oldState, newState) {

      const prevLatestMessage = oldState.messages[0];

      const relevantNewMessages = [];

      for (let i=0; i < newState.messages.length; i++) {
        const msg = newState.messages[i];

        if (prevLatestMessage && msg[0] === prevLatestMessage[0] && msg[2] === prevLatestMessage[2]) {
          break;
        }
        relevantNewMessages.unshift(msg);
      }

      relevantNewMessages.forEach(
        rnm => self.messages.unshift({ ...CTFMessage.fromCTDFormat(rnm) })
      );
    },

    reset() {
      self.messages = [];
    }
  })
);
