import angular from 'angular';
import { Ams } from '../../../../amsconfig';
import { licenseVM } from '../../../../core/services/store/licensing/selectors';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IApiResolverService } from '../../../../reference';
import ModalTemp from './modals/addLicense.html';
import Temp from './licensing.html';

const Licensing = {
   selector: 'licensing',
   template: Temp,
   bindings: {},
   /** @ngInject */
   controller: ['$scope', '$http', 'clientDataStore', '$mdDialog', 'apiResolver', class LicensingComponent {
      sub_;
      sub2_;
      license;

      constructor(
         $scope,
         private $http: angular.IHttpService,
         clientDataStore: ClientDataStore,
         private $mdDialog,
         private apiResolver: IApiResolverService
      ) {
         this.sub_ = clientDataStore.SelectLicense();

         this.sub2_ = clientDataStore.Selector(licenseVM)
            .subscribe(l => {
               this.license = l;
            });

         $scope.$on('$destroy', () => {
            //this.sub_.dispose(); //no need to dispose this one I guess.
            this.sub2_.dispose();
         });
      }

      addLicenseFile = () => {
         this.$mdDialog.show({
            controller: ['$scope', '$mdDialog', ($scope, $mdDialog) => {
               $scope.cancel = () => $mdDialog.cancel();
               $scope.add = () => {
                  if ($scope.licenseText) {
                     this.apiResolver.resolve('system.license@post', $scope.licenseText)
                        .then(() => {
                           $mdDialog.cancel();
                        }, (result) => {
                           console.log(result.data);
                           $scope.licenseErrors = result.data;
                        });
                  }
               }
            }],
            template: ModalTemp,
            parent: angular.element(document.body),
            //targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false
         });
      }

      triggerLicenseUpdate = () => {
         this.$http.post(Ams.Config.BASE_URL + `/api/license/checknow`, {});
      };

      triggerSendInstallInfo = () => {
         this.$http.post(Ams.Config.BASE_URL + `/api/system/sendinstalldata`, {});
      };


   }]
};

export default Licensing;
