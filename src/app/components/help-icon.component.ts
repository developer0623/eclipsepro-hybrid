import angular from 'angular';
const HelpIcon_ = {
    selector: 'helpIcon',
    bindings: {
        header: '<',
        help: '<',
    },
    // Load the template
    template: `<md-icon md-font-icon="mdi-information-outline" class="mdi s16 info-icon" ng-if="($ctrl.help | translate) !== $ctrl.help">
                <ms-tooltip md-direction="left">
                    <div class="tooltip-header">{{$ctrl.header | translate}}</div>
                    <div class="tooltip-body" ng-bind-html="$ctrl.help | translate"></div><!-- {{$ctrl.help | translate}}-->
                </ms-tooltip>
            </md-icon>
            <div ng-if="($ctrl.help | translate) === $ctrl.help" class="no-info-data">
            </div>`,
    controller: function () {

    },
    controllerAs: '$ctrl'
}

export default HelpIcon_;
