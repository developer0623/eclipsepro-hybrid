import { IMachineSetups, IMachineSetup } from '../../../../../core/dto';
import { Ams } from '../../../../../amsconfig';
import * as _ from 'lodash';
import Temp from './xl200-setups.html';

const XL200Setups = {
  selector: 'xl200Setups',
  template: Temp,
  bindings: {
    machineId: '=',
  },
  /** @ngInject */
  controller: ['$http', class XL200SetupsComponent {
    machineId: number;
    currentSetups: IMachineSetups;
    sortedCurrentSetups: IMachineSetups;
    allSetups: IMachineSetups[];
    showChangedOnly = false;
    searchTxt: string = '';
    sortKey = '';
    sortDir = '';

    /** @ngInject */
    constructor(private $http: angular.IHttpService) {

    }

    onClose(selectedItem) {
      selectedItem.isOpen = !selectedItem.isOpen;

      if (selectedItem.isOpen)
        selectedItem.history = this.getSetupHistory(selectedItem);
    }

    getSetupHistory(selectedItem: IMachineSetup) {
      let history = this.allSetups.flatMap(s => {
        let i = s.parameters
          .map(x => x.setupName)
          .indexOf(selectedItem.setupName);
        return i < 0
          ? []
          : !s.parameters[i].hasChanged
            ? []
            : [
              {
                setupValue: s.parameters[i].setupValue,
                date: s.date,
                libraryName: s.libraryName,
                libraryId: s.libraryId,
              },
            ];
      });
      console.log(history);
      return history;
    }

    $onChanges() {
      if (this.machineId) {
        Rx.Observable.fromPromise(
          this.$http.get<IMachineSetups[]>(
            Ams.Config.BASE_URL + `/_api/machine/${this.machineId}/setups`
          )
        ).subscribe(response => {
          this.allSetups = response.data;
          this.currentSetups = response.data[0];
          this.sortedCurrentSetups = response.data[0];
        });
      }
    }

    onSortBy(val) {
      if (val === this.sortKey) {
        if (this.sortDir === '') {
          this.sortDir = 'asc';
        } else if (this.sortDir === 'asc') {
          this.sortDir = 'desc';
        } else if (this.sortDir === 'desc') {
          this.sortDir = '';
        }
      } else {
        this.sortDir = 'asc';
        this.sortKey = val;
      }

      if (this.sortDir === '') {
        this.sortedCurrentSetups = this.currentSetups;
      } else {
        const parameters = _.orderBy(this.currentSetups.parameters, this.sortKey, this.sortDir);
        this.sortedCurrentSetups = { ...this.sortedCurrentSetups, parameters };
      }

    }
  }],
};

export default XL200Setups;
