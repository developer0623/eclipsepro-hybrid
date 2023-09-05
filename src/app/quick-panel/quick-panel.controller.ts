import * as angular from "angular";
import { AlertsDataService } from "../core/services/alertdata.service";

QuickPanelController.$inject = ['alertDataService', '$http']
export function QuickPanelController(alertDataService: AlertsDataService, $http) {
    let vm = this;

    vm.alerts = alertDataService.alerts;

    // Methods
    vm.postAction = function (url) {
        $http.post(url);
    };

}
