import { types } from 'mobx-state-tree';

import { Message as CTFMessage } from '../messages';

export const Message = types.model({
  category: types.optional(types.string, ''),
  message: types.string,
  style: types.union(types.string, types.undefined, types.null),
  carNum: types.union(types.string, types.undefined, types.null),
  timestamp: types.Date
});

export const Messages = types.model({
  messages: types.array(Message),
  highWaterMark: types.optional(types.Date, new Date(0))
}).actions(
  self => ({
    update(oldState, newState) {

      // Underlying assumption here: we'll never get a new message with the same
      // timestamp as the newest message from the previous state.
      // (If that happens, we'll end up silently dropping messages.)

      const relevantNewMessages = [];

      for (let i=0; i < newState.messages.length; i++) {
        const msg = newState.messages[i];
        if (msg[0] <= self.highWaterMark.getTime()) {
          break;
        }
        relevantNewMessages.unshift(msg);
      }

      relevantNewMessages.forEach(
        rnm => self.messages.unshift({ ...CTFMessage.fromCTDFormat(rnm) })
      );

      if (self.messages.length > 0) {
        self.highWaterMark = self.messages[0].timestamp;
      }
    },

    reset() {
      self.messages = [];
    }
  })
);
