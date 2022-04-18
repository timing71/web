import { FlagState, Stat } from "../../../racing";
import { RaceControlMessage } from "../../messages";
import { dasherizeParts, parseTime, titleCase } from "../utils";

const SECTOR_STATS = [
  Stat.S1,
  Stat.BS1,
  Stat.S2,
  Stat.BS2,
  Stat.S3,
  Stat.BS3,
  Stat.S4,
  Stat.BS4,
  Stat.S5,
  Stat.BS5,
];

const TRACK_DATA = [
  'Track temp',
  'Air temp',
  'Wind speed',
  'Wind direction',
  'Humidity',
  'Track',
  'Weather'
];

const FLAG_MAP = {
  'Green': FlagState.GREEN,
  'Red': FlagState.RED,
  'Yellow': FlagState.SC,
  'FCY': FlagState.FCY,
  'Finished': FlagState.CHEQUERED,
  'Complete': FlagState.CHEQUERED,
  'Pending': FlagState.NONE,
  'Active': FlagState.NONE
};

const CAR_STATE_MAP = {
  'Running': 'RUN',
  'Missing': 'STOP',
  'Finished': 'FIN',
  'NotStarted': 'N/S'
};

export class Client {
  constructor(hub, sessionID, onStateChange, onManifestChange) {
    this.hub = hub;
    this.onStateChange = onStateChange;
    this.onManifestChange = onManifestChange;

    this.onClassification = this.onClassification.bind(this);
    this.onControlBroadcast = this.onControlBroadcast.bind(this);
    this.onSectorTimes = this.onSectorTimes.bind(this);
    this.onSession = this.onSession.bind(this);
    this.onSetTimeRemaining = this.onSetTimeRemaining.bind(this);
    this.onUpdateWeather = this.onUpdateWeather.bind(this);

    this.getManifest = this.getManifest.bind(this);
    this.getState = this.getState.bind(this);
    this.mapCar = this.mapCar.bind(this);
    this.mapSession = this.mapSession.bind(this);
    this.mapTrackData = this.mapTrackData.bind(this);

    this.reset();

    hub.on(
      'connected',
      () => {
        hub.call('RegisterConnectionId', sessionID, true, true, true);

        hub.on('updatesession', this.onSession);
        hub.call('GetSessionData', sessionID).then((s) => this.onSession([s]));

        hub.on('classification', this.onClassification);
        hub.on('updateresult', this.onClassification);
        hub.call('GetClassification', sessionID).then(this.onClassification);

        hub.on('addintermediate', this.onSectorTimes);
        hub.call('GetIntermediatesTimes', sessionID).then(this.onSectorTimes);

        hub.on('updateweather', this.onUpdateWeather);
        hub.call('GetWeatherData', sessionID).then(w => this.onUpdateWeather(w.slice(-1)));

        hub.on('controlbroadcast', this.onControlBroadcast);
        hub.on('settimeremaining', this.onSetTimeRemaining);

      }
    );
  }

  reset() {
    this.session = {};
    this.classification = {};
    this.times = {};
    this.sectorTimes = {};
    this.lastSeenSectors = {};
    this.bestSectorTimes = {};
    this.weather = {};
  }

  onClassification(classification) {
    classification.forEach(
      car => {
        this.classification[car.ID] = car;
      }
    );

    this.onStateChange(this.getState());
  }

  onControlBroadcast(messages) {
    const rcMessages = messages.filter(
      m => m.Message !== ''
    ).map(
      m => new RaceControlMessage(
        m.Message.slice(9)
      )
    );
    this.onStateChange({
      extraMessages: rcMessages.map(m => m.toCTDFormat())
    });
  }

  onSectorTimes(data) {
    data.forEach(
      d => {
        const cid = d.CompetitorID;
        if (!this.sectorTimes[cid]) {
          this.sectorTimes[cid] = {};
        }
        this.sectorTimes[cid][d.Id] = d;
        this.lastSeenSectors[cid] = d.Id;
      }
    );
    this.onStateChange(this.getState());
  }

  onSession([ session ]) {

    if (session.ID !== this.session.ID && this.session.ID) {
      this.reset();
    }

    this.session = {
      ...this.session,
      ...session,
      refTime: Date.now()
    };
    this.onManifestChange(this.getManifest());
    this.onStateChange(this.getState());
  }

  onSetTimeRemaining(data) {
    this.times = {
      ...data[0],
      reference: Date.now()
    };
    this.onStateChange(this.getState());
  }

  onUpdateWeather([ weather ]) {
    this.weather = {
      ...this.weather,
      ...weather
    };
    this.onStateChange(this.getState());
  }

  get sectorCount() {
    return (this.session?.TrackSectors || []).filter(s => !s.IsSpeedTrap).length;
  }

  getManifest() {
    const colSpec = [
      Stat.NUM,
      Stat.STATE,
      Stat.CLASS,
      Stat.POS_IN_CLASS,
      Stat.DRIVER,
      Stat.CAR,
      Stat.LAPS,
      Stat.GAP,
      Stat.INT
    ].concat(
      SECTOR_STATS.slice(0, this.sectorCount * 2)
    ).concat([
      Stat.LAST_LAP,
      Stat.BEST_LAP,
      Stat.PITS
    ]);

    return {
      name: this.session?.Series || '',
      description: titleCase(
        dasherizeParts(
          this.session?.TrackDisplayName || this.session?.TrackName,
          this.session?.Name
        )
      ),
      colSpec,
      trackDataSpec: TRACK_DATA
    };
  }

  getState() {
    return {
      cars: this.orderedCars.map(this.mapCar),
      session: this.mapSession()
    };
  }

  mapCar(c) {

    const sectorCols = [];

    const lastSeenSector = this.lastSeenSectors[c.ID] || 99;
    const hasFastestLap = this.session.FastLapCompetitorID === c.ID;

    (this.session.TrackSectors || []).filter(s => !s.IsSpeedTrap).forEach(
      sector => {
        if (this.sectorTimes[c.ID] && this.sectorTimes[c.ID][sector.ID]) {
          const st = this.sectorTimes[c.ID][sector.ID];
          sectorCols.push([
            st.Time > 0 ? st.Time / 1e6 : '',
            st.Time > 0 && st.Time === st.BestTime ? st.BestTime === sector.BestTime ? 'sb' : 'pb' : lastSeenSector < sector.ID ? 'old' : ''
          ]);
          sectorCols.push([
            st.BestTime > 0 ? st.BestTime / 1e6 : '',
            st.BestTime === sector.BestTime ? 'sb' : 'old'
          ]);
        }
        else {
          sectorCols.push(['', '']);
          sectorCols.push(['', '']);
        }
      }
    );

    const lastLap = parseTime(c.LastLapTime);
    const bestLap = parseTime(c.CurrentSessionBest);

    return [
      c.StartNumber,
      c.InPits ? 'PIT' : CAR_STATE_MAP[c.Status] || c.Status,
      c.SubClass || c.PrimaryClass || '',
      c.PIC,
      c.Name,
      c.Vehicle,
      c.Laps,
      c.Gap,
      c.Diff
    ].concat(sectorCols).concat([
      [lastLap, lastLap === bestLap ? hasFastestLap ? 'sb-new' : 'pb' : ''],
      [bestLap, hasFastestLap ? 'sb' : ''],
      c.PitStops
    ]);
  }

  mapSession() {
    const state = {
      flagState: FLAG_MAP[this.session.State] || FlagState.NONE,
      pauseClocks: !this.times.r,
      trackData: this.mapTrackData()
    };

    if (this.times.d) {
      const timeRemain = parseInt(this.times.d[2], 10) +
      (60 * parseInt(this.times.d[1], 10)) +
      ( 3600 * parseInt(this.times.d[0], 10));

      if (this.times.r) {
        const delta = Date.now() - this.times.reference;
        state.timeRemain = Math.max(0, timeRemain - (delta / 1000));
      }
      else {
        state.timeRemain = timeRemain;
      }
    }
    else {
      state.timeRemain = (this.session.TimeRemaining || 0) / 1e6;
    }

    if (this.session.LengthLaps > 0) {
      state.lapsRemain = this.session.LapsRemaining;
    }

    return state;
  }

  mapTrackData() {
    return [
      `${this.weather.TrackTemp || '-'}°C`,
      `${this.weather.AirTemp || '-'}°C`,
      `${this.weather.WindSpeed || '-'} mph`,
      `${this.weather.WindDirection || '-'}°`,
      `${this.weather.Humidity || '-'}%`,
      this.session.TrackConditions,
      this.session.WeatherConditions
    ];
  }

  get orderedCars() {
    if (false && this.session?.SortMethod === 'FastestThenTimeOfDay') {
      /*
        Custom sort method: TSL's `Pos` property only gets updated as cars cross
        the start/finish line. But _in theory_ we have enough information to
        update the race order as cars cross each timing (sector/speed trap) line:

        - Greatest number of completed laps first
        - Then furthest timing sector on that lap, greatest first
        - Then time at which that timing line was crossed, earliest (smallest) first

        If we don't have sufficient information to determine that order, fall
        back on the TSL-calculated position.

        Disabled since needs more thinking about (need to differentiate current
        lap's sectors and previous lap's sectors) - consider e.g. when leader
        has reached first sector on his current lap, previous car has not...

        LEADER 5 laps S1
        SECOND 5 laps S1   S2   S3
      */

      const lastSectorID = (this.session?.TrackSectors || [])[0]?.ID;
      return Object.values(this.classification || {}).sort(
        (a, b) => {
          const laps = b.Laps - a.Laps;
          if (laps) {
            return laps;
          }

          const lastSeenA = this.lastSeenSectors[a.ID] === lastSectorID ? -1 : this.lastSeenSectors[a.ID];
          const lastSeenB = this.lastSeenSectors[b.ID] === lastSectorID ? -1 : this.lastSeenSectors[b.ID];

          const sectors = lastSeenB - lastSeenA;
          if (sectors) {
            return sectors;
          }

          const sectorsA = this.sectorTimes[a.ID];
          const sectorsB = this.sectorTimes[b.ID];

          if (sectorsA && sectorsB) {
            const passingA = sectorsA[this.lastSeenSectors[b.ID]];
            const passingB = sectorsB[this.lastSeenSectors[b.ID]]; // Note: we do mean "b" - need to compare passing time of same sector!

            if (passingA && passingB) {
              return (passingA?.PassingTime || 0) - (passingB?.PassingTime || 0);
            }

          }

          return a.Pos - b.Pos;

        }
      );
    }

    return Object.values(this.classification || {}).sort(
      (a, b) => (a.Pos || 0) - (b.Pos || 0)
    );
  }

  close() {
    this.hub.close();
  }
}
