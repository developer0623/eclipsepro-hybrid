import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IData, IReducedData, loadCrossFilter } from "../explorer-reference";
import { ProductionExplorerDataService } from '../../../../core/services/productionexplorerdata.service';
import GoodTemplate from './good-production.html';

const GoodProductionExplorer = {
  selector: 'goodProductionExplorer',
  template: GoodTemplate,
  bindings: {},
  /** @ngInject */
  controller: ['$scope', 'productionExplorerDataService', class GoodProductionExplorerComponent {
    dataService: any;
    cfData: any;
    reduceAdd(p: number, v: IData): number {
      p += v.goodLocal;
      return p;
    }

    reduceRemove(p: number, v: IData): number {
      p -= v.goodLocal;
      return p;
    }

    filter(item: IData) {
      return item.goodFt > 0;
    }

    reduceOrder(item: IReducedData) {
      return item.goodLocal;
    }
    update() {
      this.dataService.onDateRangeChange();
      this.cfData.update();
    }

    resetAll() {
      this.cfData.resetAll();
    }
    constructor(
      $scope: angular.IScope,
      productionExplorerDataService: ProductionExplorerDataService
    ) {
      this.dataService = productionExplorerDataService;
      this.dataService.updateQueryString();

      const load = () => {
        this.cfData = loadCrossFilter(
          this.dataService.data,
          d =>
            this.filter(d) &&
            moment(d.date).isSameOrAfter(this.dataService.startDate, 'day') &&
            moment(d.date).isSameOrBefore(this.dataService.endDate, 'day'),
          this.reduceAdd,
          this.reduceRemove,
          this.reduceOrder
        );
      };

      load();

      const updatesSub_ = productionExplorerDataService.updateNotification
        // It is quite possible for the subscription to fire _before_ this
        // member has been populated. With some thought we can likely refactor
        // this hokiness out of here.
        .where(() => this.cfData)
        .subscribe(() => {
          this.cfData.update(productionExplorerDataService.data);
        });

      $scope.$on('$destroy', () => {
        console.log('destroying');
        updatesSub_.dispose();
      });
    }
  }],
};

export default GoodProductionExplorer;
