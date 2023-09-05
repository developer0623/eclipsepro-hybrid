import { ADD_DEVICE_EXPLORER_DATA, ADD_EXPLORER_DATA, SET_DEVICE_EXPLORER_AVAILABLE_DATE_RANGE, SET_EXPLORER_AVAILABLE_DATE_RANGE } from "./actions";
import { IDeviceExplorerDataModel, IExplorerDataModel } from "./models";


const initial: IExplorerDataModel = {
   explorerData: [],
   range: {
      // 30 days ago. This ugliness per https://stackoverflow.com/a/31665235/947
      minDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      maxDate: new Date()
   }
};
export function ExplorerDataReducer(data = initial, action) {
   switch (action.type) {
      case ADD_EXPLORER_DATA: {
         const by = selector => (e1, e2) => selector(e1) > selector(e2) ? -1 : 1;

         const concated = action.payload.concat(data.explorerData);

         let distincted = [];
         // Distinct by id
         const map = new Map();
         for (const item of concated) {
            if (!map.has(item.id)) {
               map.set(item.id, null);
               distincted.push(item)
            }
         }

         return {
            ...data,
            explorerData: distincted.sort(by(x => x.date))
         };
      }
      case SET_EXPLORER_AVAILABLE_DATE_RANGE: {
         return { ...data, range: action.payload };
      }
   }
   return data;
}

const initialDevice: IDeviceExplorerDataModel = {
   explorerData: [],
   range: {
      // 30 days ago. This ugliness per https://stackoverflow.com/a/31665235/947
      minDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      maxDate: new Date()
   }
};
export function DeviceExplorerDataReducer(data = initialDevice, action) {
   switch (action.type) {
      case ADD_DEVICE_EXPLORER_DATA: {
         const by = selector => (e1, e2) => selector(e1) > selector(e2) ? -1 : 1;

         const concated = action.payload.concat(data.explorerData);

         let distincted = [];
         // Distinct by id
         const map = new Map();
         for (const item of concated) {
            if (!map.has(item.id)) {
               map.set(item.id, null);
               distincted.push(item)
            }
         }

         return {
            ...data,
            explorerData: distincted.sort(by(x => x.date))
         };
      }
      case SET_DEVICE_EXPLORER_AVAILABLE_DATE_RANGE: {
         return { ...data, range: action.payload };
      }
   }
   return data;
}
