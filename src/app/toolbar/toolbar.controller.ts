import * as angular from "angular";
import { AlertsDataService } from "../core/services/alertdata.service";
import { UserSession } from "../core/services/store/user/selectors";
import { IAuthService } from "../reference";
import { AppService } from '../core/services/appService';
import AliceJpg from '../../assets/images/avatars/alice.jpg';


type SearchItem = {
   entity: 'View',
   sref: string,
   entityId: string
}

ToolbarController.$inject = ['$scope', '$mdSidenav', 'alertDataService', 'searchService', 'authService', 'appService', 'clientDataStore']
export function ToolbarController($scope, $mdSidenav, alertDataService: AlertsDataService, searchService, authService: IAuthService, appService: AppService, clientDataStore) {
   let vm = this;
   vm.showSearch = false;

   vm.alertService = alertDataService;
   vm.searchService = searchService;
   vm.appService = appService;

   vm.toggleSidenav = toggleSidenav;

   clientDataStore.Selector(UserSession)
      .subscribe(user => {
         if (user !== null) {
            vm.user = user;
         } else {
            vm.user = { userName: '' };
         }
      });

   vm.logout = function (ev: angular.IAngularEvent) {
      authService.logout();
   }

   vm.gotoProfile = function (ev: angular.IAngularEvent) {

   }

   vm.loadImage = function () {
      return AliceJpg;
   };

   function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
   }

   ///// Searching
   vm.toggleSearch = toggleSearch;
   vm.selectSearchItem = selectSearchItem;

   function toggleSearch() {
      vm.searchService.searchText = '';
      vm.showSearch = !vm.showSearch;
      if (vm.showSearch) {
         setTimeout(function () {
            (document.querySelector('#searchBox') as any).focus();
         }, 0);
      }
   }

   function selectSearchItem(item: SearchItem) {
      if (item) {
         vm.showSearch = false;
         vm.searchService.selectedItemChange(item);
      }
   }

   $scope.$on('isFolded', function (event, data) {
      vm.isFolded = data;
      if (vm.isFolded) {
         angular.element(document.querySelector('.md-autocomplete-suggestions-container')).addClass('isFolded');
      } else {
         angular.element(document.querySelector('.md-autocomplete-suggestions-container')).removeClass('isFolded');
      }
   });

   $scope.$on('hideSearch', function (event, data) {
      vm.showSearch = data;
   });
};
