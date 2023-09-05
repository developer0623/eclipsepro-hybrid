import * as angular from "angular";
import Rx from 'rx';
import { ClientDataStore } from "./clientData.store";
import { Sch } from "./jobs.service.types";

productionSummaryService.$inject = ['clientDataStore']
export function productionSummaryService(clientDataStore: ClientDataStore) {
    return new ProductionSummaryService(clientDataStore);
}


export class ProductionSummaryService {

    public data: Array<any>;
    machines: Sch.Machine[];
    machineSub_: any;
    markerId: number = 0;

    constructor(private clientDataStore: ClientDataStore) {
        this.machines = [];
        this.machineSub_ = clientDataStore.SelectMachines().filter(ms => ms && ms.length > 0);
    }

    selectProductionSummary(): Rx.Observable<any[]> {
        // Jobs that are not on a schedule have a machine id of zero.
        let productionSummaryObs = this.clientDataStore.SelectProductionSummaryReport();
        return productionSummaryObs;


    }
}
