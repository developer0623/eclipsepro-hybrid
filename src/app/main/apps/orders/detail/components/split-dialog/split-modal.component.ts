import { RebundleResult } from "../../../../../../core/dto";
import { Ams } from "../../../../../../amsconfig";
import { SetRebundleResult } from "../../../../../../core/services/store/order/actions";
import Temp from "./split-modal.html";
declare let gtag;
const SplitModal_ = {
   selector: "splitModal",
   bindings: {
      ordId: "<",
      items: "<",
      itemIds: "<",
      maxPieces: "<",
      maxWeight: "<",
   },
   template: Temp,
   /** @ngInject */
   controller: ['$mdDialog', '$http', 'clientDataStore', '$timeout', function SplitDialogController(
      $mdDialog,
      $http: angular.IHttpService,
      clientDataStore,
      $timeout
   ) {
      let ctrl = this;
      ctrl.targetQty = 1;
      ctrl.targetWeight = 10;
      ctrl.targetItemCount = 2;
      ctrl.moveQty = 1;
      ctrl.errors = [];
      ctrl.splitToNewBundles =
         localStorage.getItem("order.splitToNewBundles") === "true";
      ctrl.selectedTabIdx = parseInt(
         localStorage.getItem("order.splitTabIndex")
      );

      ctrl.cancel = () => {
         $mdDialog.cancel();
      };

      ctrl.save = () => {
         localStorage.setItem(
            "order.splitToNewBundles",
            ctrl.splitToNewBundles ? "true" : "false"
         );
         const tabToUrlMap = [
            "splititems/targetquantity",
            "splititems/targetweight",
            "splititems/targetitemcount",
            "splititems/onenewitem",
         ];
         $http
            .post<RebundleResult>(
               `${Ams.Config.BASE_URL}/api/ordercommand/rebundle/${
                  tabToUrlMap[ctrl.selectedTabIdx]
               }`,
               {
                  ordId: ctrl.ordId,
                  items: ctrl.items,
                  itemIds: ctrl.itemIds,
                  targetWeight: ctrl.targetWeight,
                  targetItemCount: ctrl.targetItemCount,
                  targetQty: ctrl.targetQty,
                  moveQty: ctrl.moveQty,
                  splitToNewBundles: ctrl.splitToNewBundles,
               },
               {
                  headers: {
                     "Content-Type": "application/json",
                  },
               }
            )
            .then((result) => {
               console.log(result.data);
               clientDataStore.Dispatch(new SetRebundleResult(result.data));
               $mdDialog.hide();
               gtag(
                  "event",
                  `orderDetail_${tabToUrlMap[ctrl.selectedTabIdx].replace(
                     "/",
                     "_"
                  )}`,
                  {
                     event_category: "orderDetail",
                     event_label: tabToUrlMap[ctrl.selectedTabIdx],
                     value: ctrl.itemIds.length,
                  }
               );
            })
            .catch((result) => {
               console.error(result);
               ctrl.errors = result.data.errors;
            });
      };

      ctrl.tabClicked = () => {
         localStorage.setItem("order.splitTabIndex", ctrl.selectedTabIdx);
      };

      ctrl.init = () => {
         ctrl.targetQty = ctrl.maxPieces;
         ctrl.targetWeight = ctrl.maxWeight;
      };

      $timeout(function () {
         ctrl.init();
      });
   }],
};

export default SplitModal_;
