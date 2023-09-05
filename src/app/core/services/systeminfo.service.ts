import * as angular from "angular";
import { Ams } from "../../amsconfig";

declare function rg4js(string, any);

systemInfoService.$inject = ['$http']
export function systemInfoService($http) {
    let service = {
        lastServerUpdate: Date.now,
        systemInfo: {},
        updateInfo: {},
        agentStatus: {},
        refresh: getCurrentSystemInfo
    };

    // TODO: Replace all use of this service with `clientDataStore.Selector(SystemInfo)`

    function getCurrentSystemInfo() {
        $http.get(Ams.Config.BASE_URL + '/api/checkUpdate').then(function (data) {
            service.updateInfo = data;
        });
        $http.get(Ams.Config.BASE_URL + '/api/agentStatus').then(function (data) {
            service.agentStatus = data.data;
        });
    }

    getCurrentSystemInfo();
    return service;
}
