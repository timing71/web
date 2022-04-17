import { FlagState, Stat } from "../../../racing";
import { dasherizeParts, parseTime } from "../utils";

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
    this.onSectorTimes = this.onSectorTimes.bind(this);
    this.onSession = this.onSession.bind(this);
    this.onSetTimeRemaining = this.onSetTimeRemaining.bind(this);

    this.getManifest = this.getManifest.bind(this);
    this.getState = this.getState.bind(this);
    this.mapCar = this.mapCar.bind(this);
    this.mapSession = this.mapSession.bind(this);

    this.reset();

    hub.on(
      'connected',
      () => {
        hub.call('RegisterConnectionId', sessionID, true, true, true);

        hub.on('updatesession', this.onSession);
        hub.call('GetSessionData', sessionID).then(this.onSession);

        hub.on('classification', this.onClassification);
        hub.on('updateresult', this.onClassification);
        hub.call('GetClassification', sessionID).then(this.onClassification);

        hub.on('addintermediate', this.onSectorTimes);
        hub.call('GetIntermediatesTimes', sessionID).then(this.onSectorTimes);

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
  }

  onClassification(classification) {
    classification.forEach(
      car => {
        this.classification[car.ID] = car;
      }
    );

    this.onStateChange(this.getState());
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
  }

  onSession(session) {
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
      description: dasherizeParts(
        this.session?.TrackDisplayName || this.session?.TrackName,
        this.session?.Name
      ),
      colSpec
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
      [lastLap, lastLap === bestLap ? hasFastestLap ? 'sb-new' : 'sb' : ''],
      [bestLap, hasFastestLap ? 'sb' : ''],
      c.PitStops
    ]);
  }

  mapSession() {
    const state = {
      flagState: FLAG_MAP[this.session.State] || FlagState.NONE,
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

    return state;
  }

  get orderedCars() {
    return Object.values(this.classification).sort(
      (a, b) => (a.Pos || 0) - (b.Pos || 0)
    );
  }

  close() {
    this.hub.close();
  }
}
