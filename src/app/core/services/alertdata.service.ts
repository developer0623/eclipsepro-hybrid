import * as angular from "angular";
import { IApiResolverService } from "../../reference";
import { IAlert, IMachine } from "../dto";
import { ClientDataStore } from "./clientData.store";
import { SystemInfo } from "./store/misc/selectors";
import Rx from 'rx';


alertDataService.$inject = ['$mdToast', 'clientDataStore'];

export function alertDataService($mdToast, clientDataStore: ClientDataStore) {

      let service = new AlertsDataService($mdToast, clientDataStore);

      clientDataStore.Selector(SystemInfo)
            .distinctUntilChanged(si => si.isSignalRConnected)
            .subscribe(si => {
                  if (!si.isSignalRConnected) {
                        service.addOfflineAlert()
                  } else {
                        service.removeOfflineAlert()
                  }
            })

      return service;
}


export class AlertsDataService {
      alerts: IAlert[] = []
      criticalAlertsLength: 0
      firstLoad = true;
      machines: IMachine[];
      machineSub_: Rx.IDisposable

      constructor(private $mdToast, clientDataStore: ClientDataStore) {
            this.machines = [];
            this.machineSub_ = clientDataStore.SelectMachines().filter(ms => ms && ms.length > 0).subscribe(ms => {
                  this.machines = ms;
            });

            clientDataStore.SelectAlerts()
                  .subscribe(alerts => {
                        this.applyAlertUpdates(alerts);
                  })

      }

      applyAlertUpdates(newAlerts) {
            //first, look for new alerts
            //I'm sure there is a way better way to do this. Ugly for now...
            if (!this.firstLoad) {
                  for (let newI = 0; newI < newAlerts.length; newI++) {
                        let found = false;
                        for (let oldI = 0; oldI < this.alerts.length; oldI++) {
                              if (newAlerts[newI].id === this.alerts[oldI].id) {
                                    found = true;
                                    break;
                              }
                        }
                        if (!found && newAlerts[newI].isCritical) {
                              //new critical alert, toast it
                              let message = 'New alert: ' + newAlerts[newI].title;
                              this.$mdToast.show(this.$mdToast.simple().textContent(message).position('top right').hideDelay(2000).parent('#content'));
                        }
                  }
            }

            this.alerts.length = 0;
            this.criticalAlertsLength = 0;
            newAlerts.forEach(a => {
                  if (a.machineNumber > 0) {
                        a.machine = this.machines.find(m => m.machineNumber === a.machineNumber);
                  }
                  this.alerts.push(a);
                  if (a.isCritical) { this.criticalAlertsLength++; }
            });
            this.firstLoad = false;
      }
      addOfflineAlert() {
            let newAlert = {
                  id: '00000000-0000-0000-0000-000000000000',
                  alertType: 'Unknown',
                  referenceId: '0',
                  title: 'EclipsePro Server is Offline',
                  created: Date(),
                  updated: Date(),
                  expires: '0001-01-01T00:00:00.0000000-06:00',
                  icon: 'server-off',
                  iconColor: 'red-fg',
                  link: '',
                  description: 'EclipsePro server cannot be contacted. SignalR is attempting to reconnect...',
                  percentComplete: 0,
                  isCritical: true,
                  actions: []
            };

            this.alerts.push(newAlert);
            this.criticalAlertsLength++;
      }

      removeOfflineAlert() {
            const i = this.alerts.findIndex(a => a.id === '00000000-0000-0000-0000-000000000000');
            if (i > -1) {
                  this.alerts.splice(i, 1)
                  this.criticalAlertsLength--;
            }
      }

}
