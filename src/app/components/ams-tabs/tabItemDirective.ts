export function AmsMdTabItem () {
  return {
    require: '^?amsMdTabs',
    link:    function link (scope, element, attr, ctrl) {
      if (!ctrl) return;
      ctrl.attachRipple(scope, element);
    }
  };
}
