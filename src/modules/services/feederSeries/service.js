import { Service } from '../service';
import { getManifest, translate } from './translate';

export class FeederSeries extends Service {

  constructor(...args) {
    super(...args);
    this._socket = null;

    this._handlePayload = this._handlePayload.bind(this);
    this._handleMessage = this._handleMessage.bind(this);

    this._state = {};

    this._timestamps = {};
  }

  get _negotiateURL() {
    return `https://${this.host}/streaming/negotiate?clientProtocol=2.1`;
  }

  _connectURL(token) {
    return `wss://${this.host}/streaming/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${token}&connectionData=%5B%7B%22name%22%3A%22streaming%22%7D%5D&tid=9`;
  }

  start(connectionService) {
    connectionService.fetch(this._negotiateURL).then(
      (response) => {
        const data = JSON.parse(response);

        this._socket = connectionService.createWebsocket(
          this._connectURL(encodeURIComponent(data['ConnectionToken'])),
          this.service.uuid
        );

        this._socket.on(
          'open',
          () => {
            this._socket.send(`{H: "streaming", M: "JoinFeeds", A: ["${this.series}", ["data", "weather", "status", "time", "racedetails"]], I: 0}`);
            this._socket.send(`{H: "streaming", M: "GetData2", A:["${this.series}",["data","statsfeed","weatherfeed","sessionfeed","trackfeed","timefeed","racedetailsfeed"]],I:1}`);
          }
        );

        this._socket.on(
          'message',
          (rawMsg) => {
            if (rawMsg.data) {
              this._handlePayload(
                JSON.parse(rawMsg.data)
              );
            }
            else {
              this._handlePayload(
                JSON.parse(rawMsg.toString())
              );
            }
          }
        );
      }
    );
  }

  _handlePayload(payload) {

    if (payload.M) {
      payload.M.forEach(
        m => this._handleMessage(m)
      );
    }

    if (payload.R) {
      if (payload.R.data) {
        this._state.data = { ...payload.R.data[2] };
        this._timestamps.data = new Date(payload.R.data[0]).getTime();
      }

      if (payload.R.timefeed) {
        this._state.timefeed = {
          clockRunning: payload.R.timefeed[1],
          timeRemaining: payload.R.timefeed[2]
        };
        this._timestamps.timefeed = new Date(payload.R.timefeed[0]).getTime();
      }

      Object.entries(payload.R).forEach(
        ([key, value]) => {
          if (value.length === 2) {
            this._state[key] = value[1];
            this._timestamps[key] = new Date(value[0]).getTime();
          }
        }
      );
    }

    this._afterUpdate();

  }

  _handleMessage(msg) {
    const msgType = msg.M;
    const timestamp = new Date(msg.A[0]).getTime();

    if (!this._timestamps[msgType] || this._timestamps[msgType] < timestamp) {
      this._timestamps[msgType] = timestamp;

      switch(msgType) {

        case 'datafeed':
          const data = msg.A[2] || {};
          (data.lines || []).forEach(
            line => {
              const { sectors, driver, ...rest } = line;

              const car = this._state.data[driver.RacingNumber];

              if (sectors) {
                sectors.forEach(
                  sector => {
                    car.sectors[parseInt(sector.id, 10) - 1] = sector;
                  }
                );
              }

              this._state.data[driver.RacingNumber] = {
                ...car,
                ...rest
              };
            }
          );
          break;

        case 'statsfeed':
          const stats = msg.A[1];
          (stats.lines || []).forEach(
            line => {
              const { driver, ...rest } = line;
              this._state.statsfeed[driver.RacingNumber] = {
                ...this._state.statsfeed[driver.RacingNumber],
                ...rest
              };

            }
          );
          break;

        case 'timefeed':
          this._state.timefeed = {
            clockRunning: msg.A[1],
            timeRemaining: msg.A[2]
          };
          break;

        case 'weatherfeed':
          this._state.weatherfeed = {
            ...this._state.weatherfeed || {},
            [msg.A[1]]: msg.A[2]
          };
          break;

        case 'sessionfeed':
        case 'trackfeed':
        case 'racedetailsfeed':
          this._state[msgType] = msg.A[1];
          break;

        default:
      }
    }
  }

  _afterUpdate() {
    this.onManifestChange(getManifest(this._state));
    this.onStateChange(translate(this._state, this._timestamps));
  }

  stop() {

  }

}
