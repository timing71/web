import { Service } from "../service";
import { Client } from "./client";

export class SwissTiming extends Service {

  constructor(namespace, profile, ...args) {
    super(...args);

    this._onUpdate = this._onUpdate.bind(this);

    this._client = new Client(
      namespace,
      profile,
      this._onUpdate
    );
  }

  start(connectionService) {
    this._client.start(connectionService);
  }

  _onUpdate() {

  }

  stop() {

  }

}

SwissTiming.regex = /.*\.sportresult\.com/;
