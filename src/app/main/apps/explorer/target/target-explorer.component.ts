import * as angular from "angular";
import { IData, IReducedData } from "../explorer-reference";
import { ProductionExplorerDataService } from '../../../../core/services/productionexplorerdata.service';

const TargetOeeExplorer = {
  selector: 'targetOeeExplorer',
  templateUrl: 'app/main/apps/explorer/target/target.html',
  bindings: {},
  /** @ngInject */
  controller: ['$scope', 'productionExplorerDataService', class TargetOeeExplorerComponent {
    dataService: any;
    cfData: any;

    // OOE and Target can't be converted to the simple value because they are a percent. That needs to be
    // created from a division operation on two data points.
    reduceAdd(p: IReducedData, v: IData): IReducedData {
      p.goodFt += v.goodFt;
      p.targetAvailabilityPotentialFt += v.targetAvailabilityPotentialFt;
      p.speedPotentialFt += v.speedPotentialFt;
      p.yieldPotentialFt += v.yieldPotentialFt;

      p.targetPercent =
        p.targetAvailabilityPotentialFt !== 0
          ? p.goodFt / p.targetAvailabilityPotentialFt
          : 0;
      p.availabilityPercent =
        p.targetAvailabilityPotentialFt !== 0
          ? p.speedPotentialFt / p.targetAvailabilityPotentialFt
          : 0;
      p.speedPercent =
        p.speedPotentialFt !== 0 ? p.yieldPotentialFt / p.speedPotentialFt : 0;
      p.yieldPercent =
        p.yieldPotentialFt !== 0 ? p.goodFt / p.yieldPotentialFt : 0;

      return p;
    }

    reduceRemove(p: IReducedData, v: IData): IReducedData {
      p.goodFt -= v.goodFt;
      p.targetAvailabilityPotentialFt -= v.targetAvailabilityPotentialFt;
      p.speedPotentialFt -= v.speedPotentialFt;
      p.yieldPotentialFt -= v.yieldPotentialFt;

      p.targetPercent =
        p.targetAvailabilityPotentialFt !== 0
          ? p.goodFt / p.targetAvailabilityPotentialFt
          : 0;
      p.availabilityPercent =
        p.targetAvailabilityPotentialFt !== 0
          ? p.speedPotentialFt / p.targetAvailabilityPotentialFt
          : 0;
      p.speedPercent =
        p.speedPotentialFt !== 0 ? p.yieldPotentialFt / p.speedPotentialFt : 0;
      p.yieldPercent =
        p.yieldPotentialFt !== 0 ? p.goodFt / p.yieldPotentialFt : 0;
      return p;
    }

    filter(item: IData) {
      return (
        item.goodFt > 0 &&
        item.targetAvailabilityPotentialFt > 0 &&
        item.speedPotentialFt > 0 &&
        item.yieldPotentialFt > 0
      );
    }

    reduceOrder(item: IReducedData) {
      return item.targetPercent;
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

      const load = () => {
        // this.cfData = loadCrossFilter(
        //   this.dataService.data,
        //   d =>
        //     this.filter(d) &&
        //     moment(d.date).isSameOrAfter(this.dataService.startDate, 'day') &&
        //     moment(d.date).isSameOrBefore(this.dataService.endDate, 'day'),
        //   this.reduceAdd,
        //   this.reduceRemove,
        //   this.reduceOrder
        // );
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

export default TargetOeeExplorer;
