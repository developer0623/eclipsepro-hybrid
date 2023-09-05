import * as angular from "angular";
import { ClientDataStore } from "./clientData.store";
import { Dispatcher } from "./lib/store";
import { InitDeviceExplorerData, SetDeviceExplorerDataCurrentRange } from "./store/productionexplorer/actions";
import { DeviceExplorerData, mapDeviceData } from "./store/productionexplorer/selectors";

productionDeviceExplorerDataService.$inject = ['unitsService', 'clientDataDispatcher', 'clientDataStore']
export function productionDeviceExplorerDataService(unitsService, clientDataDispatcher: Dispatcher, clientDataStore: ClientDataStore) {
   return new ProductionDeviceExplorerDataService(unitsService, clientDataDispatcher, clientDataStore);
}

export class ProductionDeviceExplorerDataService {

   data = [];
   startDate: Date;
   endDate: Date;
   minDate: Date;
   maxDate: Date;
   updateNotification: Rx.Observable<void>
   onDateRangeChange: () => void;

   constructor(unitsService, clientDataDispatcher: Dispatcher, clientDataStore: ClientDataStore) {

      const dataSub = clientDataStore.Selector(DeviceExplorerData)
         .map(mapDeviceData());//unitsService

      const daysBack = 17;
      // TODO: These should change via the controls
      this.startDate = new Date(new Date().getTime() - (daysBack * 24 * 60 * 60 * 1000)),
      this.endDate = new Date(),

      // Default assumption we can go back 30 days, until the store tells us otherwise.
      this.minDate = new Date(new Date().setDate(new Date().getDate() - 30)),
      this.maxDate = new Date(),

      this.updateNotification = dataSub.map(_ => { });

      this.onDateRangeChange = () => {
         clientDataDispatcher.dispatch(new SetDeviceExplorerDataCurrentRange({ startDate: this.startDate, endDate: this.endDate }));
      }
      clientDataDispatcher.dispatch(new InitDeviceExplorerData({ startDate: this.startDate, endDate: this.endDate }));

      const explorerDataSub_ = dataSub
         .subscribe(newData => {
            this.minDate = newData.range.minDate;
            this.maxDate = newData.range.maxDate;
            this.data = newData.explorerData;
         });
   }
}

