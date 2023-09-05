
const AlertGeneral = {

  bindings: {
    alert: '='
  },
  // Load the template
  template: `<div class="md-list-item-text" layout="column" layout-align="space-between">
  
              <div layout="row" layout-align="space-between">
  
                  <md-tooltip md-direction="bottom">{{$ctrl.alert.description | translate}}</md-tooltip>
                  <h3><i class="mdi s24 mr-5" ng-class="{ 'mdi-{{$ctrl.alert.icon}} {{$ctrl.alert.iconColor}}': $ctrl.alert.icon }"></i> {{$ctrl.alert.title | translate}}</h3>
  
                  <div layout="row" ng-repeat="action in $ctrl.alert.actions track by $index" ng-if="$ctrl.alert.actions.length >= 1">
                      <md-tooltip md-direction="top">{{action.title | translate}}</md-tooltip>
                      <a ng-attr-href="{{action.link}}" ng-attr-target="{{action.target}}" ng-if="action.target!=='post'">
                          <i class="mdi s24 secondary-text" ng-class="{ 'mdi-{{action.icon}}': action.icon }"></i>
                      </a>
                      <a ng-attr-href="javascript:void(0);" ng-click= "vm.postAction(action.link)" ng-if="action.target==='post'">
                          <i class="mdi s24 secondary-text" ng-class="{ 'mdi-{{action.icon}}': action.icon }"></i>
                      </a>
  
                  </div>
  
              </div>
  
              <div class="ph-24 pt-10">
                  <div>

                  {{$ctrl.alert.subTitle}}
                  
                  <a ng-if="$ctrl.alert.kbLink" href="{{$ctrl.alert.kbLink}}" target="_blank">
                      <md-tooltip md-direction="top">Link to knowledge base article</md-tooltip>
                      <i class="mdi s20 secondary-text mdi-help-circle"></i>
                  </a>
                  </div>
  
                  <md-progress-linear class="alerts-tab-progress" ng-if="$ctrl.alert.percentComplete > 0" md-mode="determinate" value="{{$ctrl.alert.percentComplete * 100}}"></md-progress-linear>
  
              </div>
  
          </div>`,
  controller: function () {
  }
}

export default AlertGeneral;