import dayjs from '../../../datetime';
import { RaceControlMessage } from '../../messages';
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
    this._handleRCMessages = this._handleRCMessages.bind(this);
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
    this._prevRCMessage = null;

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
    const newMessages = this._handleRCMessages(data);
    this._sessionData = data;
    this.updateTiming(newMessages);
  }

  _handleRCMessages(data) {
    // m.Time is of form "30.04.2022 13:25:47".

    // Note: we can ONLY use m.Time or m.ParsedTime to compare messages against
    // each other to find newer ones. Since there is no timezone data included,
    // we have no idea what time it actually refers to (and browsers will assume
    // it's in the local timezone of the user, which it probably isn't).
    const currMessages = (data.Messages || []).map(
      m => ({
        ...m,
        ParsedTime: dayjs(m.Time, 'DD.MM.YYYY HH:mm:ss')
      })
    );

    const newMessages = currMessages.filter(
      m => !this._prevRCMessage || m.ParsedTime.unix() > this._prevRCMessage
    );

    if (newMessages.length > 0) {
      this._prevRCMessage = Math.max(...newMessages.map(m => m.ParsedTime.unix()));
    }

    return newMessages.map(
      m => new RaceControlMessage(m.Text).toCTDFormat()
    );

  }

  updateTiming(extraMessages=[]) {
    if (this._timingData?.UnitId && this._sessionData?.UnitId) {

      const newState = translateState(
        this._timingData,
        this._sessionData,
        this._prevLastLaps
      );

      this.onStateChange({
        ...newState,
        extraMessages
      });
    }
  }

  stop() {

  }

}

SwissTiming.regex = /.*\.sportresult\.com/;
