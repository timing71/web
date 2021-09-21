/* eslint-disable */

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
