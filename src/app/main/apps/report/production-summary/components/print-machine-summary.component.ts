import PrintSummaryTemplate from './print-machine-summary.component.html';
const PrintSummary = {
  selector: 'printSummary',
  bindings: {
    machine: '<',
    data: '<'
  },
  template: PrintSummaryTemplate,
  controller: function () {
    let self = this;
  }
}

export default PrintSummary;
