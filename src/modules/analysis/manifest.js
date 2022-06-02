import { types } from 'mobx-state-tree';

export const Manifest = types.model({
  name: types.optional(types.string, ''),
  description: types.optional(types.string, ''),
  colSpec: types.array(types.frozen(types.array)),
  startTime: types.optional(types.Date, new Date())
});
