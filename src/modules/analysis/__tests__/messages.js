import { Messages, Message } from '../messages';
import { Message as CTFMessage } from '../../messages';
import { onPatch } from 'mobx-state-tree';

describe('Message', () => {
  it('can be instantiated with a CTF Message object', () => {
    const ctf = new CTFMessage('category', 'message', 'style', 'carNum');
    const msg = Message.create({ ...ctf });

    expect(msg.category).toEqual(ctf.category);
  });
});

describe('Messages', () => {

  it('records new messages', () => {
    const msgs = Messages.create();

    msgs.update(
      { messages: [ [5] ] },
      {
        messages: [ [5] ],
        newMessages: [
          [6, 'six', 'six message', 'sixStyle'],
          [5, 'five', 'five message', 'fiveStyle'],
          [2, 'two', 'two message', 'twoStyle'],
          [1, 'one', 'one message', 'oneStyle'],
        ]
      }
    );

    expect(msgs.messages.length).toEqual(4);
    expect(msgs.messages[0].message).toEqual('six message');
  });

  it('causes an onPatch event', (done) => {
    const msgs = Messages.create({
      messages: [
        { ...CTFMessage.fromCTDFormat([2, 'two', 'two message', 'twoStyle']) },
        { ...CTFMessage.fromCTDFormat([1, 'one', 'one message', 'oneStyle']) }
      ]
    });

    onPatch(msgs, (p) => {
      expect(p.op).toEqual('add');
      expect(p.value?.message).toEqual('five message');
      done();
    });

    msgs.update(
      { messages: [ [5] ] },
      {
        messages: [ [5] ],
        newMessages: [
          [5, 'five', 'five message', 'fiveStyle']
        ]
      }
    );
  });

  it('can be reset', () => {
    const msgs = Messages.create({ messages: [{ ...new CTFMessage('m', 'ess', 'age') }] });
    expect(msgs.messages.length).toEqual(1);
    msgs.reset();
    expect(msgs.messages.length).toEqual(0);
  });
});
