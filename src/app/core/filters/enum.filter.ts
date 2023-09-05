orderStatusFilter.$inject = ['$filter']
export function orderStatusFilter($filter) {
   return function (input) {
      return input; // the input is a string created from an enum. i18n is still needed.
   };
}

