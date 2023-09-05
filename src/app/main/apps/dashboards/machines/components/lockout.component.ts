
const LockoutIndicator = {
  selector: 'lockoutIndicator',
  bindings: {
    lockout: '<'
  },
  template: `<div class="lockout">
        <md-icon md-font-icon="mdi-lock-open-alert" ng-if="$ctrl.lockout=='Unlocked'" class="mdi unlocked">
            <md-tooltip md-direction="top">The lockout for this machine is Off.</md-tooltip>
        </md-icon>
        <md-icon md-font-icon="mdi-lock-question" ng-if="$ctrl.lockout=='Unknown'" class="mdi unknown">
            <md-tooltip md-direction="top">This machine does not send its lockout state. This is available in XL200 version 4.58.00 or greater.</md-tooltip>
        </md-icon>
    </div>`,
  controller: ['$element', function ($element) {
    let self = this;
    $element.addClass('lockout-indicator');
  }],
  controllerAs: '$ctrl'
}
export default LockoutIndicator;
