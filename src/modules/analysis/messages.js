import { types } from 'mobx-state-tree';

import { Message as CTFMessage } from '../messages';

export const Message = types.model({
  category: types.string,
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

      // Underlying assumption here: we'll never get a new message with the same
      // timestamp as the newest message from the previous state.
      // (If that happens, we'll end up silently dropping messages.)

      const oldMessageIndex = oldState.messages.length > 0 ? oldState.messages[0][0] : -1;
      const relevantNewMessages = newState.messages.filter(
        m => m[0] > oldMessageIndex
      );

      relevantNewMessages.forEach(
        rnm => self.messages.unshift({ ...CTFMessage.fromCTDFormat(rnm) })
      );
    },

    reset() {
      self.messages = [];
    }
  })
);
