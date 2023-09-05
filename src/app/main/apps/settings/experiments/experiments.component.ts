import { ClientDataStore } from '../../../../core/services/clientData.store';
import Temp from './experiments.html';

const Experiments = {
    selector: 'experiments',
    template: Temp,
    bindings: {},
    /** @ngInject */
    controller: ['$scope', 'clientDataStore', class ExperimentsComponent {
        machines = [];
        loading = false;
        machineSub_;
        constructor($scope: angular.IScope, clientDataStore: ClientDataStore) {
            this.machineSub_ = clientDataStore.SelectMachineStates()
                .subscribe(m => {
                    this.machines = m;
                });
            $scope.$on('$destroy', () => {
                this.machineSub_.dispose();
            });
        }
    }]
};

export default Experiments;
