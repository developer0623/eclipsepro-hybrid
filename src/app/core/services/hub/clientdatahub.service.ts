
import *  as signalR from "@microsoft/signalr";
import { Ams } from "../../../amsconfig";
import { Fx } from "../../dto";
import { Put, Del, Initialize, SignalrDisconnectedAction, SignalrConnectedAction, SignalrReconnectedAction } from "../clientData.actions";
import { Dispatcher } from "../lib/store";


export const clientDataHubService = (clientDataDispatcher: Dispatcher) => {
   return new ClientDataHub(clientDataDispatcher);
}
clientDataHubService.$inject = ['clientDataDispatcher']

export interface IClientDataHub {
   addSubscription: (sub: Fx.Subscription) => void;
   deleteSubscription: (sub: Fx.Subscription) => void;
}

class ClientDataHub implements IClientDataHub {
   connection;


   constructor(private clientDataDispatcher: Dispatcher) {
      const server = Ams.Config.BASE_URL;
      this.connection = new signalR.HubConnectionBuilder()
         .withUrl(server + '/hubs')
         .withAutomaticReconnect()
         .configureLogging(signalR.LogLevel.Information)
         .build();
      //   'clientDataHub', {
      //       rootPath: '',
      //       queryParams: { BUILD_NUMBER }, // Send our version number to the server.
      //       autoReconnect: true,
      //       reconnectTimeout: 5000,
      //       methods: [],
      //       listeners: {}
      //    });

      this.connection.on('objectPut', (collection, data) => {
         this.clientDataDispatcher.dispatch(new Put(collection, data));
      });

      this.connection.on('objectDelete', (collection, id) => {
         this.clientDataDispatcher.dispatch(new Del(collection, id));
      });

      this.connection.on('objectBatchPut', (collection, batch) => {
         this.clientDataDispatcher.dispatch(new Initialize(collection, batch));
      });

      // Server calls this when we connect. Put the data in the store.
      this.connection.on('sendSystemInfo', systemInfo => {
         this.clientDataDispatcher.dispatch(new Put('SystemInfo', systemInfo));
      });

      this.connection.onclose(error => {
         console.log('ClientDataHub: disconnected', error);
         this.clientDataDispatcher.dispatch(new SignalrDisconnectedAction());
         this.start(); // the built in reconnect timed out. Now try to restart.
      });

      this.connection.onreconnecting(error => {
         console.log(`ClientDataHub: reconnecting`);
      })

      this.connection.onreconnected(error => {
         console.log(`ClientDataHub: reconnected === ${this.connection.connectionId}`, error);
         
         this.clientDataDispatcher.dispatch(new SignalrReconnectedAction());
      })

      // Start the hub connection
      this.start();
   }

   start() {
      console.log('ClientDataHub: connecting');
      this.connection.start()
         .then(() => {
            console.log(`ClientDataHub: connected === ${this.connection.connectionId}`);
            this.clientDataDispatcher.dispatch(new SignalrConnectedAction());
         })
         .catch(error => {
            console.error('ClientDataHub: error', error);
            setTimeout(() => this.start(), 5000);
         });
   }

   addSubscription(sub: Fx.Subscription) {
      if (this.connection.state === 'Connected') // connected
      {
         // The server side json binding won't bind a number[] to a string[].
         // So at the last possible place, we'll manually map.
         if (sub.filterDef.type === Fx.IN) {
            const filterDef = sub.filterDef as Fx.In;
            filterDef.values = filterDef.values.map(x => x.toString());
         }
         this.connection.invoke('AddSubscription', sub)
            .catch(error => console.error('AddSubscription call failed', sub, error));
      }
      else {
         console.log(`ClientDataHub: not connected connection.state: ${this.connection.state}, unable to subscribe to ${sub.collection}`);
      }
   }
   deleteSubscription(sub: Fx.Subscription) {
      if (this.connection.state === 'Connected') // connected
      {
         this.connection.invoke('DeleteSubscription', sub)
            .catch(error => console.error('DeleteSubscription call failed', sub, error));
      }
      else {
         console.log("not connected", "connection.state: ", this.connection.state, "unable to delete subscription to " + sub.collection)
      }
   }


}
