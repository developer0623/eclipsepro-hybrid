import { LockdownCodeValue } from '../../../../../core/dto';
const XL200LockoutItem = {
  selector: 'xl200LockoutItem',
  template: `
        <md-radio-group layout="row" ng-model="$ctrl.lockValue" ng-change="$ctrl.onUpdate()">
        <div translate="xl200.{{$ctrl.label}}" class="label-col"></div>
        <md-radio-button value="Always" aria-label="{{$ctrl.label}}:always" class="check-col xl200-radio-col"></md-radio-button>
        <md-radio-button value="WithKey" aria-label="{{$ctrl.label}}:with key" class="check-col  xl200-radio-col"></md-radio-button>
        <md-radio-button value="Never" aria-label="{{$ctrl.label}}:never" class="check-col  xl200-radio-col"></md-radio-button>
        <help-icon header="$ctrl.labelStr" help="$ctrl.helpStr" ></help-icon>
        </md-radio-group>
    `,
  bindings: {
    label: '<',
    lockValue: '=',
  },
  controller: class XL200LockoutItemComponent {
    label: string;
    labelStr: string;
    helpStr: string;
    lockValue: LockdownCodeValue;

    /** @ngInject */
    constructor() {
      this.labelStr = 'xl200.' + this.label;
      this.helpStr = 'xl200.' + this.label + '.help';
    }

    onUpdate() {
      console.log(`update label = ${this.label}, lockValue:${this.lockValue}`);
    }
  },
};

export default XL200LockoutItem;