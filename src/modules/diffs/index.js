/*
This module provides a `patch()` function compatible with the diff output of the Python `dictdiffer` package.
It allows diffs created with `dictdiffer` in Python to be applied to JS objects.
 */
export const dotLookup = (dest, path, parent=false) => {
  if (path === "" || path === []) {
    return dest;
  }

  let nodes;
  let isArray = false;

  if (Array.isArray(path)) {
    nodes = path;
    isArray = true;
  }
  else {
    nodes = path.split(".");
  }

  if (parent) {
    nodes = nodes.slice(0, -1);
  }

  let curNode = dest;

  while (nodes.length > 0) {
    const nextNode = nodes.shift();

    if (!curNode[nextNode]) {
      curNode[nextNode] = isArray ? [] : {};
    }

    curNode = curNode[nextNode];
  }

  return curNode;
};

const add = (dest, path, changes) => {
  const localDest = dotLookup(dest, path);
  changes.forEach(
    ([key, value]) => {
      localDest[key] = value;
    }
  );
};

const change = (dest, path, changes) => {
  const localDest = dotLookup(dest, path, true);

  let parentNode;
  if (Array.isArray(path)) {
    parentNode = path[path.length - 1];
  }
  else {
    const ppath = path.split(".");
    parentNode = ppath.slice(-1);
  }

  localDest[parentNode] = changes[1];
};

const remove = (dest, path, changes) => {
  const localDest = dotLookup(dest, path);
  changes.forEach(
    ([key]) => {
      delete localDest[key];
    }
  );
};

const PATCHERS = {
  add,
  change,
  remove
};


export function patch(diffResult, target) {
  const dest = JSON.parse(JSON.stringify(target));

  diffResult.forEach(
    ([action, path, changes]) => {
      PATCHERS[action](dest, path, changes);
    }
  );

  return dest;
}
