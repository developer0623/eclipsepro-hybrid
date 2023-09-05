import ShiftSummaryTemplate from './shiftSummary.html';
const ShiftSummary = {

   bindings: {
      shiftStats: '<',
      machineState: '<',
   },
   // Load the template
   template: ShiftSummaryTemplate,
   controller: function () {
   },
   controllerAs: '$ctrl'
}

export default ShiftSummary;