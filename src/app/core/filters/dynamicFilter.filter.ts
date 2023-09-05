dynamicFilterFilter.$inject = ['$interpolate']
export function dynamicFilterFilter($interpolate) {
  return function(input){
    if (!arguments[1]) {
      return arguments[0];
    }
    let result = $interpolate('{{value | ' + arguments[1] + '}}');
    return result({value:arguments[0]});
  };
}