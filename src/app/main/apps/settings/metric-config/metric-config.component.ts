import { IMachine, IMetricDefinition, IMetricConfig } from '../../../../core/dto';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { UserHasRoles } from '../../../../core/services/store/user/selectors';
import { IApiService } from "../../../../reference";
import Temp from './metric-config.html';

interface IViewModel extends IMachine {
    documentId: string,
    machineNumber: number,
    settings: (IMetricConfig & { definition: IMetricDefinition, maxValueUser: number, minValueUser: number, okRangeStartUser: number, okRangeEndUser: number, targetValueUser: number })[]
}

const MetricConfig = {
    selector: 'metricConfig',
    template: Temp,
    bindings: {},
    /** @ngInject */
    controller: ['$mdToast', 'api', 'unitsService', 'clientDataStore', class MetricConfigComponent {
        machines: IViewModel[];
        userHasEditorRole: boolean = false;
        roleSub$: Rx.IDisposable;
        metricSub$: Rx.IDisposable;

        constructor(
            private $mdToast,
            private api: IApiService,
            private unitsService,
            clientDataStore: ClientDataStore
        ) {
            this.roleSub$ = clientDataStore
              .Selector(UserHasRoles(['tooling-editor', 'administrator'], false))
              .subscribe(userHasEditorRole => {
                this.userHasEditorRole = userHasEditorRole;
              });
              
            this.metricSub$ = Rx.Observable.combineLatest(
                clientDataStore.SelectMetricDefinitions().filter(this.NOTEMPTY),
                clientDataStore.SelectMachineMetricSettings().filter(this.NOTEMPTY),
                clientDataStore.SelectMachines().filter(this.NOTEMPTY),
                (metricDefinitions, metricSettings, machines) => { return { metricDefinitions, metricSettings, machines } }
            )
                .subscribe(({ metricDefinitions, metricSettings, machines }) => {

                    let metricSettingsVm = metricSettings.map(ms =>
                        Object.assign({}, {
                            machineNumber: ms.machineNumber,
                            documentId: ms.documentId,
                            settings: ms.settings.map(setting => {
                                let definition = metricDefinitions.find(md => md.metricId === setting.metricId);
                                return Object.assign({}, setting, {
                                    definition,
                                    maxValueUser: this.getUserValue(setting.maxValue, definition.primaryUnits),
                                    minValueUser: this.getUserValue(setting.minValue, definition.primaryUnits),
                                    okRangeStartUser: this.getUserValue(setting.okRangeStart, definition.primaryUnits),
                                    okRangeEndUser: this.getUserValue(setting.okRangeEnd, definition.primaryUnits),
                                    targetValueUser: this.getUserValue(setting.targetValue, definition.primaryUnits)
                                })
                            })
                        })
                    );

                    // DATA
                    this.machines = machines.map(machine => {
                        let metricSet = metricSettingsVm.find(ms => ms.machineNumber.toString() === machine.id.toString());
                        return { ...machine, ...metricSet } as any;
                    });
                });
        }


        NOTEMPTY = x => x.length > 0;

        getUserValue(baseValue: number, baseUnit: string): number {
            if (baseUnit === '%') {
                return baseValue * 100; // use unitsService for rounding?
            }
            return this.unitsService.convertUnits(baseValue, baseUnit, 3);
        }

        getBaseValue(userValue: number, baseUnit: string, userUnit: string) {
            if (baseUnit === '%') {
                return userValue / 100; // use unitsService for rounding?
            }
            return this.unitsService.convertUnits(userValue, userUnit, 3, baseUnit);
        }

        /*
        * Update the metric
        */
        updateMetric(machine: IViewModel, metricId, memberName) {
            if (!this.userHasEditorRole) {
              this.toast('You do not have permission to edit metrics');
              return;
            }

            let metric = machine.settings.find(m => m.metricId === metricId);

            //convert user units
            let baseValue = metric[memberName];
            if (typeof (baseValue) !== 'boolean') {
                const userUnit = this.unitsService.getUserUnits(metric.definition.primaryUnits);
                baseValue = this.getBaseValue(metric[memberName + 'User'], metric.definition.primaryUnits, userUnit);
            }
            metric[memberName] = baseValue;

            // Get rid of all that stuff we added
            const payload: IMetricConfig[] = machine.settings.map(setting => {
                return {
                    metricId: setting.metricId,
                    targetValue: setting.targetValue,
                    okRangeStart: setting.okRangeStart,
                    okRangeEnd: setting.okRangeEnd,
                    maxValue: setting.maxValue,
                    minValue: setting.minValue,
                    showInMini: setting.showInMini,
                    showInLarge: setting.showInLarge,
                };
            })

            this.api.machine.metricSettings.update({ id: machine.machineNumber }, payload, (response) => {
                this.toast('Your changes have been saved.');
                return response.data;
            }, (error) => {
                this.toast('Error! Your changes have not been saved');
            });
        }

        $onDestroy() {
          if (this.roleSub$) {
            this.roleSub$.dispose();
          }
          if (this.metricSub$) {
            this.metricSub$.dispose();
          }
         }
    
        private toast(textContent: string) {
          this.$mdToast.show(
            this.$mdToast
              .simple()
              .textContent(textContent)
              .position('top right')
              .hideDelay(2000)
              .parent('#content')
          );
        }

        /**
         * Select input text on click/focus
         */
        focusSelect(form) {
            const input = form.$editables[0].inputEl;
            setTimeout(() => {
                input.select();
            }, 0);
        }

    }]
};

export default MetricConfig;
