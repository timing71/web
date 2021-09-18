import { useCallback, useContext, useEffect, useRef } from "react";
import { PluginContext } from "../../pluginBridge";
import { v4 as uuid } from 'uuid';
import { Stat } from "../../../racing";
const { Decoder } = require('socket.io-parser');

const WS_URL = 'wss://data.lemanscup.com/socket.io/?EIO=4&transport=websocket';

const CATEGORIES = {
  6: 'LMP3',
  16: 'GT3'
};

const CAR_STATES = {
  'Run': 'RUN',
  'In': 'PIT',
  'Stop': 'STOP'
};

const mapCar = (car) => {

  const llFlag = (car.lastlapTime === car.bestlapTime) ? 'pb' : '';

  return ([
    car.number,
    CAR_STATES[car.state],
    CATEGORIES[car.categoryId],
    car.categoryRanking,
    car.team,
    car.driver,
    car.car,
    car.lap,
    car.gap,
    car.gapPrev,
    car.currentSector1,
    [car.bestSector1, 'old'],
    car.currentSector2,
    [car.bestSector2, 'old'],
    car.currentSector3,
    [car.bestSector3, 'old'],
    [car.lastlapTime / 1000, llFlag],
    [car.bestlapTime / 1000, ''],
    car.speed,
    car.pitstop
  ]);
};

class Client {

  constructor(onUpdate) {
    this.entries = {};
    this.params = {};
    this.onUpdate = () => onUpdate(this);
  }

  handle(event, data) {
    switch(event) {

      case 'race':
        this.handle('params', data.params);
        this.handle('entries', data.entries);
        break;

      case 'entries':
        data.forEach(
          entry => {
            if (entry) {
              this.entries[entry.id] = entry;
            }
          }
        );
        break;

      case 'race_light':
      case 'params':
        this.params = {
          ...this.params,
          ...data
        };
        break;
      default:
        console.warn(`Unhandled event: ${event}`, data); // eslint-disable-line no-console

    }

    this.onUpdate();
  }

  getManifest() {
    return {
      name: 'Le Mans Cup',
      description: this.params.sessionName,
      columnSpec: [
        Stat.NUM,
        Stat.STATE,
        Stat.CLASS,
        Stat.POS_IN_CLASS,
        Stat.TEAM,
        Stat.DRIVER,
        Stat.CAR,
        Stat.LAPS,
        Stat.GAP,
        Stat.INT,
        Stat.S1,
        Stat.BS1,
        Stat.S2,
        Stat.BS2,
        Stat.S3,
        Stat.BS3,
        Stat.LAST_LAP,
        Stat.BEST_LAP,
        Stat.SPEED,
        Stat.PITS
    ]
    };
  }

  getState() {
    const sortedEntries = Object.values(this.entries).sort((a, b) => a.ranking - b.ranking);
    return {
      cars: sortedEntries.map(mapCar),
      session: {}
    };
  }

}

export const LeMansCup = ({ children, state, updateManifest, updateState }) => {

  const port = useContext(PluginContext);

  const onUpdate = useCallback(
    (client) => {
      updateManifest(client.getManifest());
      updateState(client.getState());
    },
    [updateManifest, updateState]
  );

  const client = useRef(new Client(onUpdate));

  useEffect(
    () => {

      const tag = uuid();

      const decoder = new Decoder();
      decoder.on('decoded', (packet) => {
        if (packet.type === 4 && packet.data) {
          const [event, data] = packet.data;
          client.current.handle(event, data);
        }
      });

      port.onMessage.addListener(
        msg => {
          if (msg.type === 'WEBSOCKET_MESSAGE' && msg.tag === tag) {
            decoder.add(msg.data);
          }
        }
      );

      port.postMessage({
        tag,
        type: 'WEBSOCKET',
        url: WS_URL
      });
    },
    [port]
  );

  return (
    <>
      { children }
    </>
  );

};

LeMansCup.regex = /live\.lemanscup\.com/;
