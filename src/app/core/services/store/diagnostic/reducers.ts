import { PUT, DEL, INITIALIZE, CHOP } from "../../clientData.actions";

export function DebugCollectionMetricsReducer(initial = {}, action) {
   let _initial = { ...initial };
   if (action.collection) {
      let collection = _initial[action.collection] || { put: 0, del: 0, initialize: 0, chop: 0 };
      switch (action.type) {
         case PUT: {
            collection = { ...collection, put: collection.put + 1 };
            break;
         }
         case DEL: {
            collection = { ...collection, del: collection.del + 1 };
            break;
         }
         case INITIALIZE: {
            collection = { ...collection, initialize: collection.initialize + 1 };
            break;
         }
         case CHOP: {
            collection = { ...collection, chop: collection.chop + 1 };
            break;
         }
      }
      _initial[action.collection] = collection;
   }

   return _initial;
}


export function DebugActionMetricsReducer(initial = {}, action) {
   let _initial = { ...initial };
   _initial[action.type] = (_initial[action.type] || 0) + 1;
   return _initial;
}