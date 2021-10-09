/* eslint-disable */

// This file contains hacked versions of the dispatch* functions from SimpleDDP,
// which causes the library to use a `_id` property to store local IDs rather
// than an `id` property, which can (and is) overridden by userspace data in
// some implementations (such as Al Kamel).

import cloneDeep from 'clone-deep';

export function dispatchAdded(m) {
  // Override this function from the original simpleddp...
  if (this.collections.hasOwnProperty(m.collection)) {
    let i = this.collections[m.collection].findIndex((obj)=>{
      return obj.id == m.id;
    });
    if (i>-1) {
      // new sub knows nothing about old sub
      this.collections[m.collection].splice(i,1);
    }
  }
  if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
  // Key change here: use _id for our local property, since sometimes the objects have another "id" property
  let newObj = Object.assign({_id:m.id},m.fields);
  let i = this.collections[m.collection].push(newObj);
  let fields = {};
  if (m.fields) {
    Object.keys(m.fields).map((p)=>{
      fields[p] = 1;
    });
  }
  this.onChangeFuncs.forEach((l)=>{
    if (l.collection==m.collection) {
      let hasFilter = l.hasOwnProperty('filter');
      let newObjFullCopy = {...newObj};
      if (!hasFilter) {
        l.f({changed:false,added:newObjFullCopy,removed:false});
      } else if (hasFilter && l.filter(newObjFullCopy,i-1,this.collections[m.collection])) {
        l.f({prev:false,next:newObjFullCopy,fields,fieldsChanged:newObjFullCopy,fieldsRemoved:[]});
      }
    }
  });
};

export function dispatchChanged(m) {
  if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
  let i = this.collections[m.collection].findIndex((obj)=>{
    return obj._id == m.id;
  });
  if (i>-1) {
    let prev = cloneDeep(this.collections[m.collection][i]);
    let fields = {}, fieldsChanged = {}, fieldsRemoved = [];
    if (m.fields) {
      fieldsChanged = m.fields;
      Object.keys(m.fields).map((p)=>{
        fields[p] = 1;
      });
      Object.assign(this.collections[m.collection][i],m.fields);
    }
    if (m.cleared) {
      fieldsRemoved = m.cleared;
      m.cleared.forEach((fieldName)=>{
        fields[fieldName] = 0;
        delete this.collections[m.collection][i][fieldName];
      });
    }
    let next = this.collections[m.collection][i];
    this.onChangeFuncs.forEach((l)=>{
      if (l.collection==m.collection) {
        // perhaps add a parameter inside l object to choose if full copy should occur
        let hasFilter = l.hasOwnProperty('filter');
        if (!hasFilter) {
          l.f({changed:{prev,next:cloneDeep(next),fields,fieldsChanged,fieldsRemoved},added:false,removed:false});
        } else {
          let fCopyNext = cloneDeep(next);
          let prevFilter = l.filter(prev,i,this.collections[m.collection]);
          let nextFilter = l.filter(fCopyNext,i,this.collections[m.collection]);
          if (prevFilter || nextFilter) {
            l.f({prev,next:fCopyNext,fields,fieldsChanged,fieldsRemoved,predicatePassed:[prevFilter,nextFilter]});
          }
        }
      }
    });
  } else {
    this.dispatchAdded(m);
  }
}

/**
 * Dispatcher for ddp removed messages.
 * @private
 * @param {Object} m - DDP message.
 */
export function dispatchRemoved(m) {
  if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
  let i = this.collections[m.collection].findIndex((obj)=>{
    return obj._id == m.id;
  });
  if (i>-1) {
    let prevProps;
    let removedObj = this.collections[m.collection].splice(i,1)[0];
    this.onChangeFuncs.forEach((l)=>{
      if (l.collection==m.collection) {
        let hasFilter = l.hasOwnProperty('filter');
        if (!hasFilter) {
          // возможно стоит сделать fullCopy, чтобы было как в случае dispatchAdded и dispatchChanged
          l.f({changed:false,added:false,removed:removedObj});
        } else {
          if (l.filter(removedObj,i,this.collections[m.collection])) {
            l.f({prev:removedObj,next:false});
          }
        }
      }
    });
  }
}
