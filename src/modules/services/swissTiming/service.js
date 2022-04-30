import { Service } from "../service";
import { Client } from "./client";
import { generateManifest, translateState } from "./translate";

export class SwissTiming extends Service {

  constructor(...args) {
    super(...args);

    this.namespace = 'RAC_PROD';
    this.profile = 'SRO';

    this._currentSeason = null;
    this._currentMeeting = null;
    this._currentSchedule = null;
    this._currentSession = null;

    this.start = this.start.bind(this);
    this.handleTiming = this.handleTiming.bind(this);
    this.handleSession = this.handleSession.bind(this);
    this.onSchedule = this.onSchedule.bind(this);
  }

  start(connectionService) {
    this._client = new Client(
      this.namespace,
      this.profile,
      this.service.uuid,
      connectionService
    );

    this._client.on('seasons', (room, data) => {
      this._currentSeason = data.CurrentSeason;

      this._client.subscribe(
        `${this._currentSeason}_SEASON`,
        'current_season',
        (_, season) => {

          this._currentMeeting = season.Meetings[season.PresentationMeetingId];

          if (this._currentMeeting) {
            this._client.subscribe(
              `${this._currentSeason}_SCHEDULE_${this._currentMeeting.Id.toUpperCase()}`,
              'schedule',
              this.onSchedule
            );

          }

        }
      );
    });
  }

  onSchedule(_, data) {
    this._currentSchedule = data;
    const currentSession = data.Units[data.PresentationRoundId];
    if (currentSession) {
      const isNewSession = this._currentSession?.Id !== currentSession.Id;
      this._currentSession = currentSession;
      if (isNewSession) {
        this.newSession(currentSession.Id);
      }
    }
  }

  newSession(id) {
    this._timingData = {};
    this._sessionData = {};
    this._prevLastLaps = {};

    this._client.subscribe(
      `${this._currentSeason}_TIMING_${id.toUpperCase()}`,
      'timing',
      this.handleTiming
    );

    this._client.subscribe(
      `${this._currentSeason}_COMP_DETAIL_${id.toUpperCase()}`,
      'session',
      this.handleSession
    );

    this.onManifestChange(
      generateManifest(
        this._currentMeeting, this._currentSchedule, this._currentSession
      )
    );
  }

  handleTiming(_, data) {
    this._timingData = data;
    this.updateTiming();
  }

  handleSession(_, data) {
    this._sessionData = data;
    this.updateTiming();
  }

  updateTiming() {
    if (this._timingData?.UnitId && this._sessionData?.UnitId) {
      this.onStateChange(
        translateState(
          this._timingData,
          this._sessionData,
          this._prevLastLaps
        )
      );
    }
  }

  stop() {

  }

}

SwissTiming.regex = /.*\.sportresult\.com/;
