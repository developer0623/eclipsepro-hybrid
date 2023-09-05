import angular from 'angular';
import { IReasonCode, ILocation, LocationCategory } from '../../../../core/dto';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import { GroupByCodeSet } from '../../../../core/services/store/warehouse/selectors';
import ReasonTemp from './modals/addReason.html';
import LocationTemp from './modals/addLocation.html';

AppSettingsController.$inject = ['$scope', '$rootScope', '$mdMedia', 'clientDataStore', '$mdDialog', 'warehouseService']
export function AppSettingsController($scope, $rootScope, $mdMedia, clientDataStore: ClientDataStore, $mdDialog, warehouseService: WarehouseService) {
    let vm = this;

    $scope.$mdMedia = $mdMedia;


    vm.removeReson = (reason: IReasonCode) => {
        warehouseService.deleteReason(reason.id).then((result) => {
            console.log("deletereason", result);
        });
    }

    vm.gotoAddReason = (ev, codeSet: string) => {
        $rootScope.codeSet = codeSet;
        $mdDialog.show({
            controller: AddReasonController,
            template: ReasonTemp,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    }

    vm.removeLocation = (location: ILocation) => {
        console.log("remove location", location);
        warehouseService.deleteLocation(location.code).then((result) => {
            console.log("deleteLocation", result);
        });
    }

    vm.gotoAddLocation = (ev, locationGrp) => {
        $rootScope.category = locationGrp.category;
        $mdDialog.show({
            controller: AddLocationController,
            template: LocationTemp,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false // Only for -xs, -sm breakpoints.
        })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';

            });
    }

    clientDataStore.SelectReasonCodes()
        .map(GroupByCodeSet)
        .subscribe(reasonGroups => {
            vm.reasons = reasonGroups;
        });

    clientDataStore.SelectLocations()
        .map(locations => {
            const init = [
                { title: 'MACHINE', items: [], doNotEdit: true, category: LocationCategory[LocationCategory.Machine] },
                { title: 'WAREHOUSE', items: [], category: LocationCategory[LocationCategory.Warehouse] },
                { title: 'STAGING BAY', items: [], category: LocationCategory[LocationCategory.StagingBay] },
                { title: 'TRUCK', items: [], category: LocationCategory[LocationCategory.Truck] },
                { title: 'LOADING DOCK', items: [], category: LocationCategory[LocationCategory.LoadingDock] },
                { title: 'BIN', items: [], category: LocationCategory[LocationCategory.Bin] }
            ];
            locations.forEach(location => {
                // Using the enum's numeric value as the index into the array.
                let listitem = init[LocationCategory[location.category]];
                if (listitem) {
                    const i = listitem.items.findIndex(l => l.id === location.id);
                    if (i >= 0) {
                        listitem.items[i] = location;
                    }
                    else {
                        listitem.items.push(location);
                    }
                } else {
                    // a new location category. Need to add it to the init. Probably use the LocationCategory value as the title.
                }
            });
            return init;
        })
        .subscribe(locations => {
            vm.locations = locations;
        });


    $scope.selectedTime = 10;

    $scope.warningTimes = [{ value: 10, name: '10mins' }, { value: 20, name: '20mins' }, { value: 30, name: '30mins' }];
}

AddReasonController.$inject = ['$scope', '$rootScope', '$mdDialog', 'warehouseService']
function AddReasonController($scope, $rootScope, $mdDialog, warehouseService: WarehouseService) {
    $scope.reason = { codeSet: $rootScope.codeSet, reason: '' };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.add = () => {
        if ($scope.reason.reason) {
            warehouseService.addReason($scope.reason).then((result) => {
                console.log("reason", result);
            });
            $mdDialog.cancel();
        }

    }

}

AddLocationController.$inject = ['$scope', '$rootScope', '$mdDialog', 'clientDataStore', 'warehouseService']
function AddLocationController($scope, $rootScope, $mdDialog, clientDataStore: ClientDataStore, warehouseService: WarehouseService) {
    $scope.location = { category: $rootScope.category, name: '' };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    $scope.add = () => {
        if ($scope.location.name) {
            warehouseService.addLocation($scope.location).then((result) => {
                console.log("location", result);
            });
            $mdDialog.cancel();
        }

    }

}
