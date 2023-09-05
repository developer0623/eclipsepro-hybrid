import MachineDashboardMiniTemplate from './machine-dashboard-mini.component.html'
obscureNumberString.$inject = ['$filter'];
export function obscureNumberString($filter) {
   return (input: string, obscure: boolean) =>
      obscure
         // Replace all digits up to the decimal point with '?'.
         // If there is no decimal, then replace all but the last digit.
         // If there is only one digit, replace it.
         ? input.replace(/(\d+)/, function (_, b) {
            if (input.indexOf(".") > -1 || b.length === 1) {
               return "?".repeat(b.length);
            } else {
               return "?".repeat(b.length - 1) + b[b.length - 1];
            }
         })
         : input;
};
const MachineDashboardMini = {
   bindings: {
      machine: '<',
      metricDefinitions: '<',
      renderUnlicensed: '<'
   },
   template: MachineDashboardMiniTemplate,
   controller: ['$element', function ($element) {
      let self = this;

      $element.addClass('machine-panel-mini');
   }],
   controllerAs: '$ctrl'
}

export default MachineDashboardMini;
