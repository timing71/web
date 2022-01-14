import { types } from "mobx-state-tree";

/*
{
  did: 1597
  i: "Track limit infringement - 3rd offense (Ch. 1 art. 41.2.5) - T9"
  lu: 695403348000000
  rid: 69
  sn: "962"  // Race number
  st: "SERVED"
  ti: 695403430000000 // Time issued (TSNL time adjusted)
  tz: 240
  v: "Warning"
}
*/

export const Penalty = types.snapshotProcessor(
  types.model({
    raceID: types.integer,
    decisionID: types.identifierNumber,
    raceNum: types.string,
    state: types.string,
    incident: types.string,
    value: types.string,
    issued: types.integer,
    updated: types.integer
  }).actions(
    self => ({
      update(json) {
        if (json.rn) {
          self.raceNum = json.rn;
        }
        if (json.st) {
          self.state = json.st;
        }
        if (json.i) {
          self.incident = json.i;
        }
        if (json.v) {
          self.value = json.v;
        }
        if (json.ti) {
          self.issued = json.ti;
        }
        if (json.lu) {
          self.updated = json.lu;
        }
      }
    })
  ),
  {
    preProcessor(json) {
      return {
        raceID: json.rid,
        decisionID: json.did,
        raceNum: json.sn,
        state: json.st,
        incident: json.i,
        value: json.v,
        issued: json.ti,
        updated: json.lu
      };
    }
  }
);

export const Creventic = types.model({
  penalties: types.map(Penalty)
}).actions(
  self => ({
    setPenalties(penalties) {
      penalties.forEach(
        p => {
          if (self.penalties.get(p.did)) {
            self.penalties.get(p.did).update(p);
          }
          else {
            self.penalties.set(p.did, Penalty.create(p));
          }

        }
      );
    },

    addPenalty(p) {
      self.penalties.set(p.did, Penalty.create(p));
    },

    clearPenalties() {
      self.penalties.clear();
    }
  })
);
