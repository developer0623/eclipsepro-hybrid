import * as angular from "angular";
import * as moment from 'moment';
import { ClientDataStore } from "./clientData.store";
import { Dispatcher } from "./lib/store";
import { InitDeviceExplorerData, SetDeviceExplorerDataCurrentRange } from "./store/productionexplorer/actions";
import { DeviceExplorerData, mapDeviceData } from "./store/productionexplorer/selectors";

productionDeviceExplorerDataService.$inject = ['unitsService', 'clientDataDispatcher', 'clientDataStore', '$location']
export function productionDeviceExplorerDataService(unitsService, clientDataDispatcher: Dispatcher, clientDataStore: ClientDataStore, $location) {
   return new ProductionDeviceExplorerDataService(unitsService, clientDataDispatcher, clientDataStore, $location);
}

export class ProductionDeviceExplorerDataService {

   data = [];
   startDate: Date = moment().add(-1, 'weeks').toDate();;
   endDate: Date = new Date();;
   minDate: Date;
   maxDate: Date;
   updateNotification: Rx.Observable<void>
   onDateRangeChange: () => void;
   /** @ngInject */

   constructor(unitsService, clientDataDispatcher: Dispatcher, clientDataStore: ClientDataStore, private $location: angular.ILocationService) {
      const queryString = $location.search();
      if (queryString.startDate) {
         const m = moment(queryString.startDate);
         if (m.isValid()) this.startDate = m.toDate();
      }
      if (queryString.endDate) {
         const m = moment(queryString.endDate);
         if (m.isValid()) this.endDate = m.toDate();
      }

      const dataSub = clientDataStore.Selector(DeviceExplorerData)
         .map(mapDeviceData());//unitsService

      const daysBack = 17;
      // TODO: These should change via the controls
      this.startDate = new Date(new Date().getTime() - (daysBack * 24 * 60 * 60 * 1000)),
      this.endDate = new Date(),

      // Default assumption we can go back 30 days, until the store tells us otherwise.
      this.minDate = new Date(new Date().setDate(new Date().getDate() - 30));
      this.maxDate = new Date();

      this.updateNotification = dataSub.map(_ => { });

      this.onDateRangeChange = () => {
         this.updateQueryString();
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

   updateQueryString = () => {
      const exportQuery = {
         startDate: moment(this.startDate).format('YYYY-MM-DD'),
         endDate: moment(this.endDate).format('YYYY-MM-DD'),
      };
      this.$location.search(exportQuery);
   }
}

