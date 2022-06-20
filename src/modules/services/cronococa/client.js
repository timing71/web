import throttle from "lodash.throttle";
import { FlagState, Stat } from "../../../racing";
import { parseTime } from "../utils";

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.STATE,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.TEAM,
  Stat.CAR,
  Stat.LAPS,
  Stat.GAP,
  Stat.INT,
  Stat.S1,
  Stat.S2,
  Stat.S3,
  Stat.LAST_LAP,
  Stat.BEST_LAP,
  Stat.PITS
];

const parseFlagString = (fs) => {
  if (fs[0] === '1') {
    return FlagState.CHEQUERED;
  }
  else if (fs[1] === '1') {
    return FlagState.SC;
  }
  else if (fs[2] === '1') {
    return FlagState.YELLOW;
  }
  else if (fs[2] === '2') {
    return FlagState.RED;
  }
  else if (fs[3] === '1') {
    return FlagState.FCY;
  }
  else if (fs[4] === '1') {
    return FlagState.YELLOW;
  }
  else if (fs[5] === '1') {
    return FlagState.YELLOW;
  }
  else if (fs[6] === '1') {
    return FlagState.YELLOW;
  }
  else if (fs[7] === '1') {
    return FlagState.NONE;
  }

  return FlagState.GREEN;
};

const TIME_FLAG_MAP = {
  'mejorado': 'pb',
  'mejorDia': 'sb'
};

export class Client {
  constructor(connection, onStateChange, onManifestChange) {

    this.onStateChange = throttle(onStateChange, 1000);
    this.onManifestChange = onManifestChange;
    this.getManifest = this.getManifest.bind(this);
    this.getState =this.getState.bind(this);

    this.data = {
      classification: [],
      sessionTime: {
        remaining: 0,
        timestamp: 0
      }
    };

    connection.on('bandera', this.onFlag.bind(this));
    connection.on('cabecera', this.onHeaderData.bind(this));
    connection.on('clasificacion', this.onClassification.bind(this));
    connection.on('meteo', this.onWeather.bind(this));
    connection.on('tiemposesion', this.onSessionTime.bind(this));
  }

  onHeaderData(data) {
    this.data['headers'] = data;
    this.onManifestChange(this.getManifest());
  }

  onClassification(classification) {
    this.data.classification = classification;
    this.onStateChange(this.getState());
  }

  onFlag(flag) {
    this.data.flag = flag.bandera || '';
    this.onStateChange(this.getState());
  }

  onSessionTime(timeString) {
    this.data.sessionTime = {
      remaining: parseTime(timeString),
      timestamp: Date.now()
    };
    this.onStateChange(this.getState());
  }

  onWeather(data) {
    this.data.weather = data;
    this.onStateChange(this.getState());
  }

  getManifest() {
    return {
      name: this.data.headers?.tituloprueba,
      description: this.data.headers?.tituloposicion,
      colSpec: COLUMN_SPEC,
      trackDataSpec: [
        'Track temp',
        'Air temp',
        'Wind speed',
        'Wind dir',
        'Humidity',
        'Pressure'
      ]
    };
  }

  getState() {
    const timeDelta = Date.now() - this.data.sessionTime.timestamp;
    const timeRemain = Math.ceil(Math.max(0, this.data.sessionTime.remaining - timeDelta));

    const session = {
      flagState: parseFlagString(this.data.flag || ''),
      timeRemain,
      trackData: [
        `${this.data.weather.TrackTemp || '-'}°C`,
        `${this.data.weather.AirTemp || '-'}°C`,
        `${this.data.weather.WindSpeed || '-'} kph`,
        `${this.data.weather.WindDirectionDegree || '-'}°`,
        `${this.data.weather.Humidity || '-'}%`,
        `${this.data.weather.Pressure || '-'} mBar`
      ]
    };

    return {
      cars: this.mapCars(),
      session
    };

  }

  mapCars() {
    return this.data.classification.map(
      (c, index) => {
        return [
          c.Dorsal,
          c.Sector === 5 ? 'PIT' : c.Sector === 6 ? 'OUT' : 'RUN',
          c.Categoria,
          c.Nombre,
          c.Concursante,
          c.Vehiculo,
          c.Vuelta,
          index > 0 ? c.GAP : '',
          index > 0 ? c.PREV : '',
          [c.TiempoIP1, TIME_FLAG_MAP[c.claseSector1] || c.Sector === 1 ? '' : 'old'],
          [c.TiempoIP2, TIME_FLAG_MAP[c.claseSector2] || c.Sector === 2 ? '' : 'old'],
          [c.TiempoIP3, TIME_FLAG_MAP[c.claseSector3] || c.Sector === 3 ? '' : 'old'],
          [c.TiempoUltimaVuelta, c.Vuelta === c.VueltaMejor ? 'pb' : ''],
          [c.TiempoMejor, 'old'],
          c.NumeroParadas
        ];
      }
    );
  }
}
