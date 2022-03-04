import simpleDDP from "simpleddp";

import { Service } from '../service';
import { dispatchAdded, dispatchChanged, dispatchRemoved } from "./ddp";
import { AlkamelSocket } from "./socket";


const MONITORED_COLLECTIONS = [
  'best_results',
  'race_control',
  'sessionBestResultsByClass',
  'sessions',
  'session_info',
  'session_entry',
  'session_status',
  'standings',
  'track_info',
  'weather'
];

const randomString = (length) => ([...Array(length)].map(() =>(~~(Math.random()*36)).toString(36)).join(''));
const randomNum = (length) => ([...Array(length)].map(() =>(~~(Math.random()*10)).toString(10)).join(''));

export class AlKamel extends Service {
  constructor(...args) {
    super(...args);

    this.feed = this.service.source.slice(this.service.source.lastIndexOf('/') + 1);
    this.server = null;
  }

  start(connectionService) {

    const uuid = this.service.uuid;

    class SpecificAKSSocket extends AlkamelSocket {
      constructor(url) {
        super(connectionService, url, uuid);
      }
    };

    this.server = new simpleDDP({
      autoConnect: false,
      endpoint: `wss://livetiming.alkamelsystems.com/sockjs/${randomNum(3)}/${randomString(8)}/websocket`,
      SocketConstructor: SpecificAKSSocket
    });
    // Evil monkeypatch:
    this.server.dispatchAdded = dispatchAdded;
    this.server.dispatchChanged = dispatchChanged;
    this.server.dispatchRemoved = dispatchRemoved;

    this.server.on('added', () => console.log("Something added"))
    this.server.on('connected', () => {
      this.server.sub('livetimingFeed', [this.feed]).ready().then(
        () => {
          console.log("They say the sub is ready")
          console.log(this.server)
        }
      );
    });

    this.server.connect()

  }

  stop() {
    this.server && this.server.disconnect();
  }
}

AlKamel.regex = /livetiming\.alkamelsystems\.com\/[0-9a-zA-Z]+/;
