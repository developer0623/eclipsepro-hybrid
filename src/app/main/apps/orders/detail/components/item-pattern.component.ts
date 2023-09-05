import { IJobItem } from '../../../../../core/dto';

const ItemPattern = {
  selector: "itemPattern",
  bindings: {
    item: "<",
    pendingSave: "<",
    createPattern: '&',
    updatePattern: '&'
  },
  template: `
  <div class="pattern-cell" ng-class="{'error-cell':$ctrl.item.patternNotDefined}">
    <span editable-text="$ctrl.item.patternName" onaftersave="$ctrl.updatePattern({patternName: $data, item: $ctrl.item})">
      <punch-pattern-preview
          pattern-id="$ctrl.item.patternId"
          text="$ctrl.item.patternName"
          hide-type="true"
      >
          <a class="td-link ml-5" ui-sref="app.punch-patterns_list.detail({id: $ctrl.item.patternId})">
            {{$ctrl.item.patternName || $ctrl.item.patternId}}
          </a>
      </punch-pattern-preview>
    </span>
    <md-button ng-if="!$ctrl.item.patternNotDefined && $ctrl.item.patternName && !$ctrl.pendingSave" ui-sref="app.punch-patterns_list.detail({id: $ctrl.item.patternId})">
      <md-tooltip md-direction="right">Open Pattern: {{$ctrl.item.patternName}}</md-tooltip>
      <md-icon md-font-icon="mdi-launch" class="mdi s24"></md-icon></md-button>
    <md-button ng-if="$ctrl.item.patternNotDefined && $ctrl.item.patternName && !$ctrl.pendingSave" ng-click="$ctrl.createPattern({patternName: $ctrl.item.patternName})">
      <md-tooltip md-direction="right">Create a new Pattern: {{$ctrl.item.patternName}}</md-tooltip>
      <md-icon md-font-icon="mdi-plus" class="mdi s24"></md-icon></md-button>
  </div>
  `,
  controller: class ItemPatternComponent {
    item: IJobItem;
  },
};

export default ItemPattern;
