import { ExpressCommState, ExpressCtrlState } from '../../../../core/dto';
import { ClientDataStore } from '../../../../core/services/clientData.store';
const ExpressView = {
  selector: 'expressView',
  template: `
    <div class="simple-table-container md-whiteframe-2dp mb-24">
      <div
        layout="row"
        class="table-title black-text"
        layout-align="center start"
      >
        Express Status 🧪
      </div>
      <div>COMM: {{$ctrl.commState.connectionState}}</div>
      <div class="ms-responsive-table-wrapper express-table">
        <div class="material-usage-item sub-header">
          <div class="unit-col">Unit</div>
          <div class="unit-col">Name</div>
          <div class="ip-col">IP Address</div>
          <div class="status-col">Status</div>
          <div class="count-col">Tx Count</div>
          <div class="main-con">Tx Received</div>
        </div>
        <div class="material-usage-content">
          <div ng-repeat="state in $ctrl.ctrlStates">
            <div class="material-usage-item">
              <div class="unit-col">{{state.id}} </div>
              <div class="unit-col">{{state.machine.description}}</div>
              <div class="ip-col">{{state.address}}</div>
              <div class="status-col">{{state.connectionState}}</div>
              <div class="count-col">{{state.txCount}}</div>
              <div class="main-con">
                <ng-container ng-if="state.last.responseReceived">
                  {{state.last.responseReceived | timeAgo:'MM/dd/yyyy'}}
                </ng-container>
              </div>
            </div>
            <div class="chart-row">
              <express-sparkline datas="state.sparkData"></express-sparkline>
              <div class="express-cmd-response">
                <div class="cmd-response-row">
                  <div class="cmd-response-title">Command:</div>
                  <div class="cmd-response-content">{{state.last.command}}</div>
                </div>
                <div class="cmd-response-row">
                  <div class="cmd-response-title">Response:</div>
                  <div class="cmd-response-content">
                    {{state.last.response}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ng-if="!$ctrl.ctrlStates">No controllers</div>
      </div>
    </div>
  `,
  bindings: {},
  /** @ngInject */
  controller: ['clientDataStore', class ExpressViewComponent {
    commState: ExpressCommState;
    ctrlStates: ExpressCtrlState[] = [];
    constructor(clientDataStore: ClientDataStore) {
      // Subscriptions
      clientDataStore.SelectAll('ExpressCtrlState').subscribe();
      clientDataStore.SelectAll('ExpressCommState').subscribe();
      clientDataStore
        .Selector(
          state =>
            [
              state.ExpressCtrlState,
              state.ExpressCommState,
              state.Machine,
            ] as const
        )
        .subscribe(([ctrlStates, commState, machines]) => {
          this.ctrlStates = ctrlStates.map(ctrl => ({
            ...ctrl,
            machine: machines.find(m => m.machineNumber === ctrl.machineNumber),
          }));
          this.commState = commState;
          console.log('ctrlStates', ctrlStates);
        });
    }
  }],
};

export default ExpressView;
