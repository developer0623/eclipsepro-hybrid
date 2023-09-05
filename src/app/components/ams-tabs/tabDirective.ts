import angular from 'angular';
export function AmsMdTab () {
  return {
    require:  '^?amsMdTabs',
    terminal: true,
    compile:  function (element, attr) {
      let label = firstChild(element, 'ams-md-tab-label'),
          body  = firstChild(element, 'md-tab-body');

      if (label.length === 0) {
        label = angular.element('<ams-md-tab-label></ams-md-tab-label>');
        if (attr.label) label.text(attr.label);
        else label.append(element.contents());

        if (body.length === 0) {
          let contents = element.contents().detach();
          body         = angular.element('<md-tab-body></md-tab-body>');
          body.append(contents);
        }
      }

      element.append(label);
      if (body.html()) element.append(body);

      return postLink;
    },
    scope:    {
      active:   '=?mdActive',
      disabled: '=?ngDisabled',
      select:   '&?mdOnSelect',
      deselect: '&?mdOnDeselect',
      tabClass: '@mdTabClass'
    }
  };

  function postLink (scope, element, attr, ctrl) {
    if (!ctrl) return;
    let index = ctrl.getTabElementIndex(element),
        body  = firstChild(element, 'md-tab-body').remove(),
        label = firstChild(element, 'ams-md-tab-label').remove(),
        data  = ctrl.insertTab({
          scope:    scope,
          parent:   scope.$parent,
          index:    index,
          element:  element,
          template: body.html(),
          label:    label.html()
        }, index);

    scope.select   = scope.select || angular.noop;
    scope.deselect = scope.deselect || angular.noop;

    scope.$watch('active', function (active) { if (active) ctrl.select(data.getIndex(), true); });
    scope.$watch('disabled', function () { ctrl.refreshIndex(); });
    scope.$watch(
        function () {
          return ctrl.getTabElementIndex(element);
        },
        function (newIndex) {
          data.index = newIndex;
          ctrl.updateTabOrder();
        }
    );
    scope.$on('$destroy', function () { ctrl.removeTab(data); });
  }

  function firstChild (element, tagName) {
    let children = element[0].children;
    for (let i = 0, len = children.length; i < len; i++) {
      let child = children[i];
      if (child.tagName === tagName.toUpperCase()) return angular.element(child);
    }
    return (angular as any).element();
  }
}
