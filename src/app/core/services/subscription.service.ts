import * as angular from "angular";
import { Fx } from "../dto";
import { ClientDataStore } from "./clientData.store";
import { IClientDataHub } from "./hub/clientdatahub.service";
import { SystemInfo } from "./store/misc/selectors";



export const subscriptionService = (clientDataHub: IClientDataHub, clientDataStore: ClientDataStore) => {
      return new SubscriptionService(clientDataHub, clientDataStore);
}

subscriptionService.$inject = ['clientDataHub', 'clientDataStore'];

export class SubscriptionService {
      constructor(private clientDataHub: IClientDataHub, private clientDataStore: ClientDataStore) { }

      private fireWhenConnected(thunk) {
            this.clientDataStore.Selector(SystemInfo)
                  .filter(info => info.isSignalRConnected)
                  .tap(thunk)
                  .subscribe();
      }

      addSubscription(subscription: Fx.Subscription) {
            this.fireWhenConnected(_ => this.clientDataHub.addSubscription(subscription));
      }
      deleteSubscription(subscription: Fx.Subscription) {
            this.fireWhenConnected(_ => this.clientDataHub.deleteSubscription(subscription))
      }
}
