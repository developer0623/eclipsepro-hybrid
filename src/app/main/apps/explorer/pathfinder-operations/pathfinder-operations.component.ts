import angular from 'angular';
import * as _ from 'lodash';
import moment from 'moment';
import { IPathfinderExplorerData, IPathfinderReducedData, loadDeviceCrossFilter, reduceInitial } from "../explorer-reference";
import PathfinderTemplate from './pathfinder-operations.html';
import { Ams } from "../../../../amsconfig";
import { ProductionDeviceExplorerDataService } from '../../../../core/services/productionDeviceExplorerdata.service';

const PathfinderOperationsExplorer = {
  selector: 'pathfinderOperationsExplorer',
  template: PathfinderTemplate,
  bindings: {},
  controller: ['$scope', 'productionExplorerDataService', class PathfinderOperationsExplorerComponent {
    dataService: any;
    cfData: any;

    reduceAdd(p: number, v: IPathfinderExplorerData): number {
      p += v.cycles;
      return p;
    }

    reduceRemove(p: number, v: IPathfinderExplorerData): number {
      p -= v.cycles;
      return p;
    }

    filter(item: IPathfinderExplorerData) {
      return item.cycles > 0;
    }

    reduceOrder(item: IPathfinderReducedData) {
      return item.cycles;
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
      productionDeviceExplorerDataService: ProductionDeviceExplorerDataService,
   ) {
      this.dataService = productionDeviceExplorerDataService;
      this.dataService.updateQueryString();

      const load = () => {
        this.cfData = loadDeviceCrossFilter(
          this.dataService.data,
          d =>
            this.filter(d) &&
            moment(d.end).isSameOrAfter(this.dataService.startDate, 'day') &&
            moment(d.end).isSameOrBefore(this.dataService.endDate, 'day'),
          this.reduceAdd,
          this.reduceRemove,
          this.reduceOrder
        );
      };

      load();

      const updatesSub_ = productionDeviceExplorerDataService.updateNotification
        // It is quite possible for the subscription to fire _before_ this
        // member has been populated. With some thought we can likely refactor
        // this hokiness out of here.
        .where(() => this.cfData)
        .subscribe(() => {
          console.log('sub update', productionDeviceExplorerDataService.data);
          this.cfData.update(productionDeviceExplorerDataService.data);
        });

      $scope.$on('$destroy', () => {
        console.log('destroying');
        updatesSub_.dispose();
      });

    }
  }],
};

export default PathfinderOperationsExplorer;
