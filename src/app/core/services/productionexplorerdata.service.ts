import * as angular from "angular";
import * as moment from 'moment';
import { ClientDataStore } from "./clientData.store";
import { Dispatcher } from "./lib/store";
import { InitExplorerData, SetExplorerDataCurrentRange } from "./store/productionexplorer/actions";
import { ExplorerData, updateLocalUnits } from "./store/productionexplorer/selectors";

productionExplorerDataService.$inject = ['unitsService', 'clientDataDispatcher', 'clientDataStore', '$location']
export function productionExplorerDataService(unitsService, clientDataDispatcher: Dispatcher, clientDataStore: ClientDataStore, $location) {
   return new ProductionExplorerDataService(unitsService, clientDataDispatcher, clientDataStore, $location);
}

export class ProductionExplorerDataService {

   data = [];
   startDate: Date = moment().add(-1, 'weeks').toDate();;
   endDate: Date = new Date();;
   minDate: Date;
   maxDate: Date;
   updateNotification: Rx.Observable<void>
   onDateRangeChange: () => void;
   /** @ngInject */
   constructor(
      unitsService,
      clientDataDispatcher: Dispatcher,
      clientDataStore: ClientDataStore,
      private $location: angular.ILocationService
   ) {
      const queryString = $location.search();
      if (queryString.startDate) {
         const m = moment(queryString.startDate);
         if (m.isValid()) this.startDate = m.toDate();
      }
      if (queryString.endDate) {
         const m = moment(queryString.endDate);
         if (m.isValid()) this.endDate = m.toDate();
      }

      const dataSub = clientDataStore.Selector(ExplorerData)
         .map(updateLocalUnits(unitsService));

      // Default assumption we can go back 30 days, until the store tells us otherwise.
      this.minDate = new Date(new Date().setDate(new Date().getDate() - 30));
      this.maxDate = new Date();

      this.updateNotification = dataSub.map(_ => { });

      this.onDateRangeChange = () => {
         this.updateQueryString();
         clientDataDispatcher.dispatch(new SetExplorerDataCurrentRange({ startDate: this.startDate, endDate: this.endDate }));
      }
      clientDataDispatcher.dispatch(new InitExplorerData({ startDate: this.startDate, endDate: this.endDate }));

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

