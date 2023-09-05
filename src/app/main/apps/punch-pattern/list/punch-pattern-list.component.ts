import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IPunchPattern, PatternDef } from "../../../../core/dto";
import PunchPatternsListTemplate from './punch-pattern-list.html';
import AddPatternModal from "./addPatternModal/addPatternModal.component";
import { UserHasRole } from '../../../../core/services/store/user/selectors';

const PunchPatternsList = {
  selector: 'punchPatternsList',
  bindings: {},
  template: PunchPatternsListTemplate,
  /** @ngInject */
  controller: ['clientDataStore', '$mdDialog', '$location', class PunchPatternsListComponent {
    dataSub_: Rx.IDisposable;
    userHasEditorRole = false;
    searchFields = [];
    columns = [
      {
        field: 'patternName',
        orderField: 'patternName',
        displayName: 'patternName',
      },
      {
        field: 'isMacro',
        orderField: 'isMacro',
        displayName: 'patternMacro',
      },
      {
        field: 'isPermanent',
        orderField: 'isPermanent',
        displayName: 'permanent',
      },
      {
        field: 'patternNumber',
        orderField: 'patternNumber',
        displayName: 'patternNumber',
      },
      {
        field: 'punchCount',
        orderField: 'punchCount',
        displayName: 'punchCount',
      },
      {
        field: 'lastUsedDate',
        orderField: 'lastUsedDate',
        displayName: 'lastUsed',
        type: 'Date'
      },
      {
        field: 'importDate',
        orderField: 'importDate',
        displayName: 'created',
        type: 'Date'
      }
    ];
    patterns: IPunchPattern[] = [];
    filterdPatterns: IPunchPattern[] = [];
    selectedOrderItem = 'patternName';
    selectedOrderDirection = '';
    selectedOrder = 'patternName';

    constructor(
      private clientDataStore: ClientDataStore,
      private $mdDialog,
      private $location: ng.ILocationService
    ) {
      this.dataSub_ = this.clientDataStore
        .SelectPunchPatterns()
        .subscribe(patterns => {
          this.patterns = patterns;
          this.filterdPatterns = patterns;
        });

      clientDataStore
        .Selector(UserHasRole('pattern-editor'))
        .subscribe(userHasEditorRole => {
          this.userHasEditorRole = userHasEditorRole;
        });

      const selectedOrderItem = localStorage.getItem('punchPattern.sortField');
      const selectedOrderDirection = localStorage.getItem('punchPattern.sortDirection');
      if (selectedOrderItem) {
        this.selectedOrderItem = selectedOrderItem;
        this.selectedOrderDirection = selectedOrderDirection;
        this.selectedOrder = `${this.selectedOrderDirection}${this.selectedOrderItem}`;
      }

    }

    onGetFilterIndex(mainTxt, searchTxt) {
      const realTxt = mainTxt.toLowerCase();
      return realTxt.indexOf(searchTxt) > -1;
    }

    onFilter(searchTxt) {
      if (!searchTxt) {
        this.filterdPatterns = this.patterns;
      } else {
        const realSearchTxt = searchTxt.toLowerCase();
        this.filterdPatterns = this.patterns.filter((item: IPunchPattern) => {
          if (this.onGetFilterIndex(item.patternName, realSearchTxt)) {
            return true;
          } else {
            return false;
          }
        });
      }
    }

    onChangeOrder(orderItem) {
      if (orderItem === this.selectedOrderItem) {
        if (this.selectedOrderDirection === '-') {
          this.selectedOrderDirection = '';
        } else {
          this.selectedOrderDirection = '-';
        }
      } else {
        this.selectedOrderItem = orderItem;
        this.selectedOrderDirection = '';
      }

      this.selectedOrder = `${this.selectedOrderDirection}${this.selectedOrderItem}`;
      localStorage.setItem('punchPattern.sortField', this.selectedOrderItem);
      localStorage.setItem('punchPattern.sortDirection', this.selectedOrderDirection);

    }
    addPattern() {
      if (!this.userHasEditorRole) {
        //this.toast('You do not have permission to edit patterns');
        return;
      }
      this.$mdDialog
        .show({
          ...AddPatternModal,
          clickOutsideToClose: true,
        })
        .then((newName: string) => {
          this.$location.path('/punch-patterns/new').search({name: newName});
        });
    }

    $onDestroy() {
      this.dataSub_.dispose();
    }
  }],
};

export default PunchPatternsList;
