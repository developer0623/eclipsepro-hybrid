
const BulletChartPreview_ = {
  selector: 'bulletChartPreview',
  bindings: {
    current: '<',
    okLower: '<',
    okUpper: '<',
    target: '<',
    minValue: '<',
    maxValue: '<',
    lowerIsBetter: '<',
    type: '<'
  },
  // Load the template
  template: `<div class="bullet-chart-preview"><svg ng-attr-width="{{$ctrl.width}}" width="100%" ng-attr-height="{{$ctrl.height}}">
    <rect class="border" x="0" y="0" width="100%" height="100%"/>
    <rect class="bad" ng-attr-x="{{$ctrl.lowerIsBetter ? $ctrl.scale($ctrl.okUpper - $ctrl.minValue) : 0}}%" y="0" ng-attr-width="{{$ctrl.lowerIsBetter ? $ctrl.scale($ctrl.maxValue-$ctrl.okUpper) : $ctrl.scale($ctrl.okLower-$ctrl.minValue)}}%" height="100%"></rect>
    <rect class="ok" ng-attr-x="{{$ctrl.scale($ctrl.okLower - $ctrl.minValue)}}%" y="0" ng-attr-width="{{$ctrl.scale($ctrl.okUpper-$ctrl.okLower)}}%" height="100%"></rect>
    <rect class="good" ng-attr-x="{{!$ctrl.lowerIsBetter ? $ctrl.scale($ctrl.okUpper - $ctrl.minValue) : 0}}%" y="0" ng-attr-width="{{!$ctrl.lowerIsBetter ? $ctrl.scale($ctrl.maxValue-$ctrl.okUpper) : $ctrl.scale($ctrl.okLower-$ctrl.minValue)}}%" height="100%"></rect>
    <path class="nv-markerTriangle target" ng-attr-transform="translate({{$ctrl.scale(($ctrl.target - $ctrl.minValue) * 3)}},8.5)" y="0" d="M0,2.8333333333333335L2.8333333333333335,-2.8333333333333335 -2.8333333333333335,-2.8333333333333335Z"></path>
    <!--<rect class="target" ng-attr-x="{{scale(target - minValue)-0.5}}%" y="0" width="1%" height="100%"></rect>-->
    <rect class="current" x="0" y="25%" ng-attr-width="{{$ctrl.scale($ctrl.current - $ctrl.minValue)}}%" height="50%"/>
    </svg></div>`,
  controller: ['$attrs', function ($attrs) {
    let self = this;
    // set default values if not specified
    self.width = $attrs.width;
    self.height = $attrs.height || 30;

    // helper functions
    self.scale = function (d) {
      let result = d * 100 / (self.maxValue - self.minValue);

      // Note: the result should never be negative
      if (result < 0) {
        result = 0;
      }

      return result;
    };

    // Note: a watch isn't needed for the current value since it is used directly in the template
    // Based on testing it looks like the range values don't need a watch, either

    // Todo: Add scope parameter for a label object (for translations).  Set fixed values if not provided


  }],
  controllerAs: '$ctrl'
};

export default BulletChartPreview_;
