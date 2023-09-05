import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IUserTaskFilters, ITaskFacet, ITaskFacetValue } from '../../../../core/dto';

WarehouseUsersController.$inject = ['$scope', '$mdMedia', 'clientDataStore']
export function WarehouseUsersController($scope, $mdMedia, clientDataStore: ClientDataStore) {
    let vm = this;

    $scope.$mdMedia = $mdMedia;

    Rx.Observable.combineLatest(
        clientDataStore.SelectTaskFilters(),
        clientDataStore.SelectUsersTaskFilters().filter(users => users.length > 0),
        (facets, usersfilters) => {

            const model = facets.map(facet => {
                const userSettings = usersfilters.map((user,i) => {
                    let isAllFacetChecked = facet.filters.every(filter => user.filters.some(f => f.filterId === filter.id && f.checked));
                    let isAnyFacetChecked = facet.filters.some(filter => user.filters.some(f => f.filterId === filter.id && f.checked));
                    return {
                        isAllFacetChecked: isAllFacetChecked,
                        isFacetIndeterminate: !isAllFacetChecked && isAnyFacetChecked,
                    }
                });

                const filters = facet.filters.map(filter => {
                    const userSettings = usersfilters.map(user => {
                        return {
                            isFilterChecked: user.filters.some(f => f.filterId === filter.id && f.checked)
                        }
                    });
                    return Object.assign({ userSettings }, filter);
                });

                return Object.assign({ userSettings }, facet, { filters });
            });

            let transferTypeFacet = facets.find(f => f.title === 'Transfer Type');


            let users: IUserViewModel[] = usersfilters.map(user => {
                let coilIsOn = user.filters.some(f => f.filterId === 'TransferType/coil' && f.checked);
                let finiIsOn = user.filters.some(f => f.filterId === 'TransferType/finished' && f.checked);

                const ttVal =
                    (coilIsOn && finiIsOn) || (!coilIsOn && !finiIsOn)
                    ? "All"
                    : coilIsOn
                        ? "Coil"
                        : "Finished Product";

                return { transferType: ttVal, ...user };
            });

            return { model, users, transferTypeFacet };
        }
    ).subscribe(({model, users, transferTypeFacet}) => {

        $scope.facets = model;
        $scope.users = users;
    });

    $scope.transferTypes = [{ title: 'All' }, { title: 'Coil' }, { title: 'Finished Product' }];
}


interface IUserViewModel extends IUserTaskFilters {
    transferType: 'All' | 'Coil' | 'Finished Product';
}
// Defines the shape of `$scope`.
interface IViewModel {
    // Data for the columns
    users: IUserViewModel[];
    // Data for the rows
    facets: Array<{userSettings: Array<{isAllFacetChecked:boolean, isFacetIndeterminate: boolean}>} & ITaskFacet & {filters: Array<{userSettings: ({isFilterChecked:boolean}&ITaskFacetValue)[] }>}>;
    // Master list of transfer type strings
    transferType: { title: string }[]
}

