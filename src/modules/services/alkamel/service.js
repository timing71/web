import ddpClient from 'ddp-client';
import throttle from 'lodash.throttle';

import { Service } from '../service';
import { AlkamelSocket } from "./socket";
import { getManifest, translate } from './translate';
import { oid } from './types';

const randomString = (length) => ([...Array(length)].map(() =>(~~(Math.random()*36)).toString(36)).join(''));
const randomNum = (length) => ([...Array(length)].map(() =>(~~(Math.random()*10)).toString(10)).join(''));

export class AlKamel extends Service {
  constructor(...args) {
    super(...args);

    const source = this.service.source;
    this.feed = this.service.source.slice(this.service.source.lastIndexOf('/') + 1);
    this.host = source.slice(source.indexOf('://') + 3, source.indexOf('.com') + 4);
    this.server = null;

    this.updateSession = this.updateSession.bind(this);

    this.sessionMonitor = null;
  }

  start(connectionService) {

    const uuid = this.service.uuid;

    class SpecificAKSSocket extends AlkamelSocket {
      constructor(url) {
        super(connectionService, url, uuid);
      }
    };

    this.server = new ddpClient({
      url: `wss://${this.host}/sockjs/${randomNum(3)}/${randomString(8)}/websocket`,
      socketContructor: SpecificAKSSocket // NB Typo 'Contructor' in ddp-client library!
    });

    try {
      this.server.EJSON.addType('oid', a => new oid(a));
    }
    catch {
      // maybe already added (HMR can cause this)
    }

    if (process.env.NODE_ENV === 'development') {
      window._ddp = this.server;
    }

    const sessionObserver = this.server.observe(
      'session_info',
      this.updateSession,
      this.updateSession,
      this.updateSession
    );
    sessionObserver.changed = this.updateSession;

    this.server.connect(
      (error, wasReconnect) => {
        this.server.subscribe('livetimingFeed', [this.feed], () => {
          // Assumption: there will only ever be one feed (I've never seen more than one)
          const feed = Object.values(this.server.collections.feeds || {})[0];
          if (feed) {
            this.server.subscribe('sessions', [feed.sessions || []]);
            this.server.subscribe('sessionInfo', [feed.sessions || []]);
          }
        });
      }
    );

  }

  updateSession() {
    const allInfo = Object.values(this.server.collections.session_info);
    const currentSessionInfo = allInfo.find(s => !s.info?.closed) || allInfo[allInfo.length - 1];
    const isFormulaE = this.host === 'livetiming-formula-e.alkamelsystems.com';

    if (currentSessionInfo && currentSessionInfo.session?.value !== this.sessionMonitor?.sessionID?.value) {
      console.log("Session change to ", currentSessionInfo.session.value); // eslint-disable-line no-console

      if (this.sessionMonitor) {
        this.sessionMonitor.stop();
      }
      this.sessionMonitor = new SessionMonitor(
        currentSessionInfo.session,
        this.server,
        isFormulaE,
        this.onStateChange,
        this.onManifestChange
      );
      this.sessionMonitor.start();
    }
  }

  stop() {
    this.sessionMonitor && this.sessionMonitor.stop();
    this.server && this.server.close();
  }
}

// These are (usually) camel-cased...
const SESSION_SUBSCRIPTIONS = [
  'entry',
  'trackInfo',
  'standings',
  'sessionStatus',
  'weather',
  'bestResults',
  'raceControl',
  'sessionBestResultsByClass',
  'sessionAttackMode'
];

// ...but these are (usually) snake-cased.
const SESSION_COLLECTIONS = [
  'track_info',
  'standings',
  'session_info',
  'session_status',
  'weather',
  'best_results',
  'race_control',
  'sessionBestResultsByClass', // ...except when they're not.
  'session_entry', // And this one is named differently
  'attackMode', // so is this
];

class SessionMonitor {
  constructor(sessionID, ddp, isFormulaE, onStateChange, onManifestChange) {
    this.sessionID = sessionID;
    this.ddp = ddp;
    this.isFormulaE = isFormulaE;
    this.onStateChange = onStateChange;
    this.onManifestChange = onManifestChange;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this._currentSessionCollections = this._currentSessionCollections.bind(this);
    this._onDataChange = throttle(
      this._onDataChange.bind(this),
      1000
    );

    this._subs = [];
    this._obs = [];
    this._pending = 0;
    this._raceControlLastIndex = -1;
  }

  start() {
    SESSION_COLLECTIONS.forEach(
      collection => {
        const observer = this.ddp.observe(collection, this._onDataChange, this._onDataChange, this._onDataChange);
        observer.changed = this._onDataChange; // Another inconsistency in ddp-client
        this._obs.push(observer);
      }
    );
    SESSION_SUBSCRIPTIONS.forEach(
      collection => {
        this._pending++;
        this._subs.push(this.ddp.subscribe(collection, [this.sessionID], () => this._pending--));
      }
    );
  }

  stop() {
    while(this._subs.length > 0) {
      this.ddp.unsubscribe(this._subs.pop());
    }
    while(this._obs.length > 0) {
      this._obs.pop().stop();
    }
  }

  _onDataChange() {
    if (this._pending === 0) {
      const collections = this._currentSessionCollections();

      this.onManifestChange(getManifest(collections, this.isFormulaE));

      const nextState = translate(collections, this.isFormulaE, this._raceControlLastIndex);
      this._raceControlLastIndex = nextState.meta.raceControlLastIndex;
      this.onStateChange(nextState);
    }
  }

  _currentSessionCollections() {
    const collections = Object.fromEntries(
      SESSION_COLLECTIONS.map(
        collection => ([ collection, mapToRelevantKey(Object.values(this.ddp.collections[collection] || {}).filter(c => c.session?.value === this.sessionID?.value)[0] || {}) ])
      )
    );

    collections['session'] = this.ddp.collections.sessions[this.sessionID.value];

    return collections;
  }
}

const mapToRelevantKey = (obj) => {
  const relevantKey = Object.keys(obj).filter(k => k !== '_id' && k !== 'session')[0];
  if (relevantKey) {
    return obj[relevantKey];
  }
  return {};
};

AlKamel.regex = /livetiming(-formula-e)?\.alkamelsystems\.com\/[0-9a-zA-Z]+/;
