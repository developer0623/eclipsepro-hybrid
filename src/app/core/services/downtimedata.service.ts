import Rx from 'rx';
import * as angular from "angular";
import { IApiResolverService } from "../../reference";
import { IScheduledDowntimeDto } from "../dto";
import { ClientDataStore } from "./clientData.store";
import { MachineDataService } from "./machinedata.service";

downtimeDataService.$inject = ['apiResolver', 'machineData', 'clientDataStore'];
export function downtimeDataService(apiResolver: IApiResolverService, machineData: MachineDataService, clientDataStore: ClientDataStore) {
   return new DowntimeDataService(apiResolver, machineData, clientDataStore);
}

export class DowntimeDataService {
   private _downtimes$: Rx.BehaviorSubject<IScheduledDowntimeDto[]> = new Rx.BehaviorSubject([]);
   downtimeObs: Rx.Observable<IScheduledDowntimeDto[]> = this._downtimes$.asObservable();
   private _downtimeUpdates$: any;

   constructor(private apiResolver, private machineData: MachineDataService, private clientDataStore: ClientDataStore) {
      this.apiResolver = apiResolver;
      this.machineData = machineData;
      this.clientDataStore = clientDataStore;

      let sub = clientDataStore.SelectScheduledDowntimeDefinition().subscribe(sdd => {
         let downtimes = sdd.map(d => {
            return this.formatDowntime(d, this.machineData.machines);
         });

         this._downtimes$.onNext(downtimes);
      })
   }

   formatDowntime(downtime, machineList) {
      let machines = [];
      angular.forEach(downtime.machines, function (downtimeMachineId) {
         if (machineList[downtimeMachineId]) {
            machines.push(machineList[downtimeMachineId].description);
         } else {
            machines.push('Machine ID ' + downtimeMachineId + ' (Error ID not valid!)');
         }
      });
      downtime.machinesText = machines.join(', ');
      return downtime;
   }
   //todo:next two methods are gone when actions are dispatched
   _addOrUpdateDowntimeInStore(downtime) {
      downtime = this.formatDowntime(downtime, this.machineData.machines);
      let downtimes = this._downtimes$.getValue();
      let index = downtimes.findIndex((d) => d.id === downtime.id);
      if (index >= 0) {
         this._downtimes$.onNext(downtimes.map(dt => dt.id === downtime.id ? downtime : dt));
      } else {
         this._downtimes$.onNext([...downtimes, downtime]);
      }
   }

   _deleteDowntimeInStore(deletedId: string) {
      let downtimes = this._downtimes$.getValue();
      this._downtimes$.onNext(downtimes.filter(dt => dt.id !== deletedId));
   }
   saveDowntime(downtimeData) {
      return this.apiResolver.resolve('downtime.downtimeDetails.saveDowntime@post', downtimeData)
         .then((result) => this._addOrUpdateDowntimeInStore(result)); //todo:dispatch this instead
   }

   updateDowntime(downtimeData) {
      return this.apiResolver.resolve('downtime.downtimeDetails.updateDowntime@update', downtimeData)
         .then((result) => this._addOrUpdateDowntimeInStore(result)); //todo:dispatch this instead
   }

   deleteDowntime(downtimeDataId: string) {
      return this.apiResolver.resolve('downtime.downtimeDetails.deleteDowntime@delete', { 'id': downtimeDataId })
         .then((result) => this._deleteDowntimeInStore(downtimeDataId)); //todo:dispatch this instead
   }

   getDowntimeMachine(downtimeId: string): IScheduledDowntimeDto {
      let downtimes = this._downtimes$.getValue();
      let d = downtimes.findIndex(d => d.id === downtimeId);
      if (d >= 0) {
         return downtimes[d];
      }
      return null;
   }
}
