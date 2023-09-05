import { ClientDataStore } from "../../../../core/services/clientData.store";
import CoilTemplate from './coil-details.html';
import { ICoilDto, IPrintTemplate, IInstalledPrinters } from '../../../../core/dto';
import CoilTagPrintDialog from "../coil-tag-print-dialog/coil-tag-print-dialog.component";

const CoilDetails = {
   selector: 'coilDetails',
   template: CoilTemplate,
   bindings: {},
   /** @ngInject */
   controller: ['$scope', '$compile', '$mdDialog', '$mdSidenav', '$mdMedia', 'clientDataStore', '$stateParams', 'api', '$mdToast', class CoilsComponent {
      coilId: string;
      coil: ICoilDto;
      printTemplates: IPrintTemplate[];
      printers: IInstalledPrinters;
      coilSub$: Rx.IDisposable;
      templateSub$: Rx.IDisposable;
      printersSub$: Rx.IDisposable;
      constructor(
         $scope: angular.IScope,
         $compile,
         private $mdDialog,
         $mdSidenav,
         $mdMedia,
         clientDataStore: ClientDataStore,
         $stateParams,
         api,
         private $mdToast
      ) {
         this.coilId = $stateParams.id;

         this.coilSub$ = clientDataStore
            .SelectCoilsIn({ property: 'coilId', values: [this.coilId] })
            .flatMap(coils => coils.filter(c => c.coilId === this.coilId))
            .subscribe(coil => {
               this.coil = coil;
            });

         this.templateSub$ = clientDataStore
            .SelectPrintTemplates()
            .map(templates => templates.filter(x => x.type === 'Coil'))
            .subscribe(printTemplates => {
               this.printTemplates = printTemplates;
            });

         this.printersSub$ = clientDataStore.SelectInstalledPrinters().subscribe(printers => {
            this.printers = printers;
         });
      }

      onPrintClick() {
         this.$mdDialog
            .show({
               ...CoilTagPrintDialog,
               locals: {
                  coilTags: this.printTemplates,
                  printers: this.printers,
                  coil: this.coil,
               },
            })
            .then(result => {
               this.$mdToast.show(
                  this.$mdToast
                     .simple()
                     .textContent(result)
                     .position('top right')
                     .hideDelay(2000)
                     .parent('#content')
               );
            });
      }

      $onDestroy() {
         if (this.coilSub$) {
            this.coilSub$.dispose();
         }
         if (this.templateSub$) {
            this.templateSub$.dispose();
         }
         if (this.printersSub$) {
            this.printersSub$.dispose();
         }
      }
   }],
};

export default CoilDetails;
