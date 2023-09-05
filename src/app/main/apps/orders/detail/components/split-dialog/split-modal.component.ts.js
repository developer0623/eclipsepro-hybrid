var SplitModal_ = {
    selector: 'splitModal',
    bindings: {
        ordId: '<',
        items: '<',
        itemIds: '<',
    },
    templateUrl: 'app/main/apps/orders/detail/components/split-dialog/split-modal.html',
    /** @ngInject */
    controller: function SplitDialogController($mdDialog, $http, clientDataStore) {
        var ctrl = this;
        ctrl.targetQty = 1;
        ctrl.targetWeight = 10;
        ctrl.targetItemCount = 2;
        ctrl.moveQty = 1;
        ctrl.errors = [];
        ctrl.splitToNewBundles =
            localStorage.getItem('order.splitToNewBundles') == 'true';
        ctrl.cancel = function () {
            $mdDialog.cancel();
        };
        ctrl.save = function () {
            localStorage.setItem('order.splitToNewBundles', ctrl.splitToNewBundles ? 'true' : 'false');
            var tabToUrlMap = [
                'splititems/targetquantity',
                'splititems/targetweight',
                'splititems/targetitemcount',
                'splititems/onenewitem',
            ];
            $http
                .post(Ams.Config.BASE_URL + "/api/ordercommand/rebundle/" + tabToUrlMap[ctrl.selectedTabIdx], {
                ordId: ctrl.ordId,
                items: ctrl.items,
                itemIds: ctrl.itemIds,
                targetWeight: ctrl.targetWeight,
                targetItemCount: ctrl.targetItemCount,
                targetQty: ctrl.targetQty,
                moveQty: ctrl.moveQty,
                splitToNewBundles: ctrl.splitToNewBundles,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(function (result) {
                console.log(result.data);
                clientDataStore.Dispatch(new SetRebundleResult(result.data));
                $mdDialog.hide();
                gtag('event', "orderDetail_" + tabToUrlMap[ctrl.selectedTabIdx].replace('/', '_'), {
                    event_category: 'orderDetail',
                    event_label: tabToUrlMap[ctrl.selectedTabIdx],
                    value: ctrl.itemIds.length,
                });
            })
                .catch(function (result) {
                console.error(result);
                ctrl.errors = result.data.errors;
            });
        };
    },
};
(function () {
    'use strict';
    angular
        .module('app.orders.detail')
        .component(SplitModal_.selector, SplitModal_);
})();
