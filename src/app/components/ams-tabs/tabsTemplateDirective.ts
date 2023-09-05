AmsMdTabsTemplate.$inject = ['$compile', '$mdUtil']
export function AmsMdTabsTemplate ($compile, $mdUtil) {
  return {
    restrict: 'A',
    link:     link,
    scope:    {
      template:     '=amsMdTabsTemplate',
      connected:    '=?mdConnectedIf',
      compileScope: '=mdScope'
    },
    require:  '^?amsMdTabs'
  };
  function link (scope, element, attr, ctrl) {
    if (!ctrl) return;

    let compileScope = ctrl.enableDisconnect ? scope.compileScope.$new() : scope.compileScope;

    element.html(scope.template);
    $compile(element.contents())(compileScope);

    return $mdUtil.nextTick(handleScope);

    function handleScope () {
      scope.$watch('connected', function (value) { value === false ? disconnect() : reconnect(); });
      scope.$on('$destroy', reconnect);
    }

    function disconnect () {
      if (ctrl.enableDisconnect) $mdUtil.disconnectScope(compileScope);
    }

    function reconnect () {
      if (ctrl.enableDisconnect) $mdUtil.reconnectScope(compileScope);
    }
  }
}
