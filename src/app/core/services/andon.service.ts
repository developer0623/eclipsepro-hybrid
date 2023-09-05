import * as angular from "angular";
import Rx from 'rx';
import { IApiResolverService } from "../../reference";
import { ClientDataStore } from "./clientData.store";
import { Put, Del } from "./clientData.actions";
import { machineLocation, selectAndOnDataForMachine } from "./store/andon/selectors";
import { IWallboardDevice } from '../dto';


andonService.$inject = ['clientDataStore', 'apiResolver']
export function andonService(clientDataStore: ClientDataStore, apiResolver: IApiResolverService) {
   return new AndonService(clientDataStore, apiResolver);
}



export class AndonService {
   constructor(private clientDataStore: ClientDataStore, private apiResolver: IApiResolverService) {
   }

   andonDataForMachineAndSequence(machineNumber: number) {

      // This takes the _subscriptions_...
      const sub1 = this.clientDataStore.SelectMachineScheduleSummaryIn({ property: 'machineNumber', values: [machineNumber] });
      const sub2 = sub1
         .flatMap(x => x)
         .where(x => x.machineNumber === machineNumber)
         .distinctUntilChanged(x => x.currentOrderId)
         .map(scheduleSummary => this.clientDataStore.SelectJobDetailIn({ property: 'ordId', values: [scheduleSummary.currentOrderId] }))
         .switch();
      const sub3 = this.clientDataStore.SelectAndonSequenceConfig();
      const sub4 = this.clientDataStore.SelectAndonViews();

      // These are taken in MachineData, so I won't double down here.
      //const sub5 = this.clientDataStore.SelectMetricDefinitions();
      //const sub6 = this.clientDataStore.SelectLocations();

      const sub6 = this.clientDataStore.SelectTasksIn({ property: 'sourceLocationId', values: [machineLocation(machineNumber)] })
      const sub7 = this.clientDataStore.SelectTasksIn({ property: 'destinationLocationId', values: [machineLocation(machineNumber)] })


      let subscriptions_ = Rx.Observable.merge<any>(sub1, sub2, sub3, sub4, sub6, sub7).subscribe();

      // ...and this gets the _data_.
      return this.clientDataStore
         .Selector(selectAndOnDataForMachine(machineNumber))
         .finally(() => subscriptions_.dispose());
   }

   updateWallboardDevice(id, contentType, contentParams, wallboardDeviceName) {
      this.apiResolver.resolve<IWallboardDevice>('wallboard.updateDevice@update', { id, contentType, contentParams, wallboardDeviceName }).then((result) => {
         this.clientDataStore.Dispatch(new Put<IWallboardDevice>('WallboardDevices', result));
      });
   }

   deleteWallboardDevice(id: string, documentID: string) {
      this.apiResolver.resolve('wallboard.deleteDevice@delete', { id }).then((result) => {
         this.clientDataStore.Dispatch(new Del<IWallboardDevice>('WallboardDevices', documentID));
      });
   }
}
