import { Stat } from "../../../racing";
import { dasherizeParts } from "../utils";

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


export class Client {
  constructor(hub, sessionID, onStateChange, onManifestChange) {
    this.hub = hub;
    this.onStateChange = onStateChange;
    this.onManifestChange = onManifestChange;

    this.onSession = this.onSession.bind(this);

    this.getManifest = this.getManifest.bind(this);

    hub.on(
      'connected',
      () => {
        hub.call('RegisterConnectionId', sessionID, true, true, true);

        hub.on('session', this.onSession);
        hub.call('GetSessionData', sessionID).then(this.onSession);
      }
    );
  }

  reset() {
    this.session = {};
    this.classification = {};
  }

  onSession(session) {
    this.session = session;
    this.onManifestChange(this.getManifest());
  }

  get sectorCount() {
    return (this.session?.TrackSectors || []).filter(s => !s.IsSpeedTrap).length;
  }

  getManifest() {
    console.log(this.session)
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

  close() {
    this.hub.close();
  }
}
