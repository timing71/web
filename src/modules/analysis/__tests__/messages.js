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
      {
        messages: [
          [5, 'five', 'five message', 'fiveStyle'],
          [2, 'two', 'two message', 'twoStyle'],
          [1, 'one', 'one message', 'oneStyle']
        ]
      },
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

  it('records new messages that arrive in non-chronological order', () => {
    const msgs = Messages.create();

    msgs.update(
      {
        messages: [
          [5, 'five', 'five message', 'fiveStyle'],
          [2, 'two', 'two message', 'twoStyle'],
          [1, 'one', 'one message', 'oneStyle']
        ]
      },
      {
        messages: [
          [4, 'four', 'this message was late', 'fourStyle'],
          [6, 'six', 'six message', 'sixStyle'],
          [5, 'five', 'five message', 'fiveStyle'],
          [2, 'two', 'two message', 'twoStyle'],
          [1, 'one', 'one message', 'oneStyle'],
        ]
      }
    );

    expect(msgs.messages.length).toEqual(2);
    expect(msgs.messages[0].message).toEqual('this message was late');
  });

  it('can be reset', () => {
    const msgs = Messages.create({ messages: [{ ...new CTFMessage('m', 'ess', 'age') }] });
    expect(msgs.messages.length).toEqual(1);
    msgs.reset();
    expect(msgs.messages.length).toEqual(0);
  });
});
