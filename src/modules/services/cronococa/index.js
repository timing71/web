import { Service } from "../service";
import { Client } from "./client";
import { Connection } from "./connection";

export class Cronococa extends Service {

  start(connectionService) {
    this._connection = new Connection();
    this._client = new Client(this._connection, this.onStateChange, this.onManifestChange);
    this._connection.start(connectionService);
  }

  stop() {
    this._connection?.stop();
  }

}

Cronococa.regex = /online.cronococa.com/;
