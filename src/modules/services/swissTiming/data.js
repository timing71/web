const PROPERTY_DELETED = '_jsondiff_del';

export const patch = (source, diff) => {

  const next = { ...source };

  Object.entries(diff).forEach(
    ([n, i]) => {
      if (i === PROPERTY_DELETED) {
        delete next[n];
      }
      else if (typeof(i) === 'object') {
        if (Array.isArray(i) || i === null) {
          next[n] = i;
        }
        else if (i.__jsondiff_t === 'a') {
          next[n] = patchArray(source[n], i);
        }
        else {
          const r = source[n];
          if (typeof(r) === 'object') {
            next[n] = patch(r, i);
          }
          else {
            next[n] = i;
          }
        }
      }
      else {
        next[n] = i;
      }
    }
  );


  return next;
};

const patchArray = (source, diff) => {

  const next = [...source];

  const updates = diff.u || {};
  Object.entries(updates).forEach(
    ([n, i]) => {
      if (typeof(i) === 'object') {
        if (i.__jsondiff_t === 'a') {
          next[n] = patchArray(source[n], i);
        }
        else {
          next[n] = patch(source[n], i);
        }
      }
      else {
        next[n] = i;
      }
    }
  );

  (diff.i || []).forEach(
    insertee => {
      next.push(insertee);
    }
  );

  return next;

};
