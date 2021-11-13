import { RaceControlMessage } from "../Message";


it('extracts car numbers from message text', () => {

  expect(new RaceControlMessage('Drive-through penalty for car #1234 for being too blue').carNum).toEqual('1234');
  expect(new RaceControlMessage('Drive-through penalty for car # 55 for being too blue').carNum).toEqual('55');
  expect(new RaceControlMessage('Car 4 reported to the stewards for being on fire').carNum).toEqual('4');

});
