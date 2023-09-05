import { PerformanceDataService } from '../../../../core/services/performanceData.service';
import Temp from './performance-standards.html';

const PerformanceStandards_ = {
  selector: 'performanceStandards',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['performanceData', class PerformanceStandardsComponent {
    focusedIndex;
    performanceData;
    constructor(performanceData: PerformanceDataService) {
      performanceData.refreshData();
      this.performanceData = performanceData;
    }

    focused = (index) => {
      this.focusedIndex = index;
    }

    getOpacityItem = (index) => {
      if (this.performanceData.previousIndex !== null && index !== this.performanceData.previousIndex) {
        return true;
      }

      if (this.focusedIndex !== index && this.focusedIndex !== null) {
        return true;
      }

      return false;
    }
  }],
};

export default PerformanceStandards_;
