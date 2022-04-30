import { Service } from "../service";
import { Client } from "./client";

export class SwissTiming extends Service {

  constructor(...args) {
    super(...args);

    this.namespace = 'RAC_PROD';
    this.profile = 'SRO';

    this._currentSeason = null;
    this._currentMeeting = null;
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
  }

  handleTiming(_, data) {

    console.log("Timing", data);

  }

  handleSession(_, data) {

    console.log("Session", data);

  }

  stop() {

  }

}

SwissTiming.regex = /.*\.sportresult\.com/;
