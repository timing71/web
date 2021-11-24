import { Messages, Message } from '../messages';
import { Message as CTFMessage } from '../../messages';

describe('Message', () => {
  it('can be instantiated with a CTF Message object', () => {
    const ctf = new CTFMessage('category', 'message', 'style', 'carNum');
    const msg = Message.create({ ...ctf });

    expect(msg.category).toEqual(ctf.category);
  });
});

describe('Messages', () => {
  it('records all messages from initial state', () => {
    const msgs = Messages.create();

    msgs.update(
      { messages: [] },
      {
        messages: [
          [2, 'two', 'two message', 'twoStyle', 'twoCarNum'],
          [1, 'one', 'one message', 'oneStyle'],
        ]
      }
    );

    expect(msgs.messages.length).toEqual(2);
  });

  it('records new messages', () => {
    const msgs = Messages.create();

    msgs.update(
      { messages: [ [5] ] },
      {
        messages: [
          [6, 'six', 'six message', 'sixStyle'],
          [5, 'five', 'five message', 'fiveStyle'],
          [2, 'two', 'two message', 'twoStyle'],
          [1, 'one', 'one message', 'oneStyle'],
        ]
      }
    );

    expect(msgs.messages.length).toEqual(1);
    expect(msgs.messages[0].message).toEqual('six message');
  });
});
