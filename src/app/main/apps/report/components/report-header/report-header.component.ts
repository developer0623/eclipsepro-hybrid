import Temp from './report-header.component.html';
const ReportHeader_ = {
  selector: 'reportHeader',
  bindings: {
    subject: '@',
    onFilter: '&',
  },
  template: Temp,
  /** @ngInject */
  controller: class ReportHeaderComponent {
    searchTxt: string = '';
    isOpenFilter = false;
    focusInput = false;
    constructor() {}
    onOpenFilter() {
      this.isOpenFilter = true;
      this.focusInput = true;
    }

    onCloseFilter() {
      this.isOpenFilter = false;
    }
  },
};

export default ReportHeader_;
