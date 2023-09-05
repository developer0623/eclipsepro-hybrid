import angular from 'angular';
import * as _ from "lodash";
import { IMachine, ITask } from '../../../../core/dto';
import { MachineDataService } from '../../../../core/services/machinedata.service';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { AndonService } from '../../../../core/services/andon.service';
import { TaskToMagicStateNumberMap } from '../../../../core/services/store/warehouse/selectors';
import ModalTemp from './editWallboard.modal.html';
import wallboardTemp from './wallboard.html';

const Wallboard = {
    selector: 'appWallboard',
    bindings: {},
    template: wallboardTemp,
    /** @ngInject */
    controller: ['$scope', '$interval','$mdDialog', '$mdMedia', 'api', 'machineData', 'clientDataStore', 'andonService', '$location', class WallboardComponent {
        machineChangeEventEmitter = new Rx.Subject<IMachine>();
        serverHost;
        selectedTabIndex = 0;
        mdMedia;
        darkTheme = true;
        andonGridOptions = {
            appendTo: 'body',
            delay: 75,
            distance: 7,
            forceHelperSize: true,
            forcePlaceholderSize: true,
            handle: false,
            helper: (event, el) => {
                return el.clone().addClass('andon-sort-helper');
            },
            placeholder: 'andon-sortable-placeholder',
            tolerance: 'pointer',
            scroll: true,
            cancel: '.unsortable',
            stop: (e, ui) => {
                let index = ui.item.parent().parent().scope().$index;
                this.updatePanelSequence(this.andonSequences[index]);
            }
        };
        timer;
        andonSequences = [];
        viewKey = '';
        playKey = '';
        editing;
        machines = [];
        sequences = [];
        wallboardDevices = [];
        andonViews = [];
        metricDefinitions = [];
        currentJob;
        currentItem;
        readyTask;
        machineData;
        sequence;
        selectedMachine;
        selectedSequence;
        metrics = [
         {
           title: 'Total(ft)',
           field: 'totalGoodLn',
           unit: 'ft',
           isChecked: true
         },
         {
           title: 'Scrap(%)',
           field: 'netScrap',
           unit: '%',
           isChecked: false
         },
         {
           title: 'ReclaimedScrap(ft)',
           field: 'reclaimedScrap',
           unit: 'ft',
           isChecked: false
         },
         {
           title: 'Run(fpm)',
           field: 'runningThroughput',
           unit: 'fpm',
           isChecked: false
         },
         {
           title: 'OEE(%)',
           field: 'oEE',
           unit: '%',
           isChecked: false
         },
         {
           title: 'Target(%)',
           field: 'target',
           unit: '%',
           isChecked: false
         },
         {
           title: 'Availability(%)',
           field: 'availability',
           unit: '%',
           isChecked: false
         },
         {
           title: 'Speed(%)',
           field: 'speed',
           unit: '%',
           isChecked: false
         },
         {
           title: 'Yield(%)',
           field: 'yield',
           unit: '%',
           isChecked: false
         },
       ];
       ranges = [
         {
           title: 'Current Shift',
           field: 'CurrentShift',
           isChecked: false
         },
         {
           title: 'Previous Shift',
           field: 'PreviousShift',
           isChecked: false
         },
         {
           title: 'Current Day',
           field: 'CurrentDay',
           isChecked: true
         },
         {
           title: 'Previous Day',
           field: 'PreviousDay',
           isChecked: false
         },
         {
           title: 'Current Week',
           field: 'CurrentWeek',
           isChecked: true
         },
         {
           title: 'Previous Week',
           field: 'PreviousWeek',
           isChecked: false
         },
         {
           title: 'Current Month',
           field: 'CurrentMonth',
           isChecked: true
         },
         {
           title: 'Previous Month',
           field: 'PreviousMonth',
           isChecked: false
         },
         {
           title: 'Past 7 Days',
           field: 'Past7Days',
           isChecked: false
         },
         {
           title: 'Past 30 Days',
           field: 'Past30Days',
           isChecked: false
         },
         {
           title: 'Past 90 Days',
           field: 'Past90Days',
           isChecked: false
         },
         {
           title: 'Year To Date',
           field: 'YearToDate',
           isChecked: false
         }
       ];

        constructor($scope, private $interval: ng.IIntervalService,
            private $mdDialog, private $mdMedia, private api, machineData: MachineDataService,
            clientDataStore: ClientDataStore, private andonService: AndonService,
            private $location: ng.ILocationService
        ) {
            this.serverHost = `${$location.protocol()}://${$location.host()}:${$location.port()}`;
            let qs = $location.search();
            if ('tab' in qs) {
                this.selectedTabIndex = parseInt(qs.tab);
            }
            // this.mdMedia = $mdMedia;
            const wallboardDevices$ = Rx.Observable.combineLatest(
                clientDataStore.SelectMachines(),
                clientDataStore.SelectWallboardDevices(),
                clientDataStore.SelectAndonSequenceConfig(),
                (machines, devices, sequences) => {
                    return { machines, devices, sequences }
                }
            )
                .subscribe(({ machines, devices, sequences }) => {
                    this.machines = machines;
                    this.sequences = sequences;
                    this.wallboardDevices = devices.map(device => {
                        let newDevice = { ...device, displayDetail: '' };
                        if (device.contentType === 'Andon') {
                            this.selectedMachine = machines.find(
                                m => m.machineNumber === Number(device.contentParams.MachineNumber)
                            ) || { description: '' };
                            this.selectedSequence = sequences.find(
                                q => q.id === device.contentParams.AndonSequenceId
                            ) || { name: '' };
                            newDevice.displayDetail = `${this.selectedMachine.description}, ${this.selectedSequence.name}`;
                        } else if (device.contentType === 'ExternalUrl') {
                            newDevice.displayDetail = device.contentParams.ExternalUrl;
                        } else if (device.contentType === 'Message') {
                            newDevice.displayDetail = device.contentParams.Message;
                        }

                        return newDevice;
                    });
                });
            const subscription1_ = this.machineChangeEventEmitter
                .map((m: IMachine) => this.andonService.andonDataForMachineAndSequence(m.machineNumber))
                .switch()
                .subscribe(data => {
                    this.andonViews = data.views;
                    this.andonViews.forEach(item => {
                        // Make definitions easy to find by indexing using viewKey.
                        this.andonViews[item.viewKey] = item;
                    });

                    this.metricDefinitions = data.metricDefinitions;
                    this.metricDefinitions.forEach((def) => {
                        // Make definitions easy to find by indexing using metricName.
                        this.metricDefinitions[def.metricName] = def;
                    });

                    this.currentJob = data.currentJob;
                    this.currentItem = data.currentItem;
                    this.readyTask = { ...data.task, magicState: TaskToMagicStateNumberMap(data.task as ITask) };
                });

            const subscription2_ = clientDataStore.SelectAndonSequenceConfig()
                .subscribe(sequences => {

                    // ANDON DATA
                    this.andonSequences = sequences;
                    this.machineData = machineData;
                    console.log('machineData.machines', machineData.machines)
                });

            // CANCEL TIMERS
            $scope.$on('destroy', function () {
                wallboardDevices$.dispose();
                this.stopSequence();
                subscription1_.dispose();
                subscription2_.dispose();
            });

        }

        selectTab() {
            this.$location.search({ tab: this.selectedTabIndex });
        }
        showEditModal(device, ev) {
            const newDevice = { ...device };
            this.$mdDialog.show({
                parent: angular.element(document.body),
                targetEvent: ev,
                template: ModalTemp,
                clickOutsideToClose: false,
                controller: EditWallboardController,
                controllerAs: 'vm',
                locals: {
                    machines: this.machines,
                    sequences: this.sequences,
                    device: newDevice,
                    metrics: this.metrics,
                    ranges: this.ranges
                }
            })
                .then((deviceData) => {
                    const { wallboardDeviceKey, contentType, contentParams, wallboardDeviceName } = deviceData;
                    this.andonService.updateWallboardDevice(wallboardDeviceKey, contentType, contentParams, wallboardDeviceName);
                });
        };

        deleteDevice(device) {
            this.andonService.deleteWallboardDevice(device.wallboardDeviceKey, device.documentID);
        }

        machineChange(selectedMachine) {
            this.machineChangeEventEmitter.onNext(selectedMachine);
        }

        onEditedSeq(sequence, isShowed) {
            sequence.isShowed = isShowed;
        }

        /**
         * Play a sequence
         */

        startSequence(sequence, i) {
            if (!i) {
                i = 0;
            }
            const advanceViewKey = () => {
                if (++i >= sequence.panels.length) {
                    i = 0;
                }
                if (!sequence.panels.length) {
                    this.initKey();
                    return;
                }
                this.setKey(sequence, i);
            }
            this.timer = this.$interval(advanceViewKey, sequence.panels[i].duration * 1000);
        }

        /**
         * Set the view / play key
         */
        setKey(sequence, index) {
            this.viewKey = sequence.panels[index].viewKey;
            this.playKey = index.toString();
        }

        /**
         * Stop sequence timer / cancel $interval
         */
        stopSequence() {
            if (this.timer) {
                this.$interval.cancel(this.timer);
            }
        }

        /**
         * Restart a sequence
         */
        restartSequence(sequence, index) {
            this.stopSequence();
            if (!sequence.panels.length) {
                this.initKey();
                return;
            }
            if (sequence.panels.length >= 1 && !this.editing) {
                this.setKey(sequence, index);
                this.startSequence(sequence, index);
            }
        }

        /**
         * Initialize view / play key
         */
        initKey() {
            this.stopSequence();
            this.viewKey = '';
            this.playKey = '';
        }

        /**
         * Find current panel
         */
        currentPanel(sequence, panel) {
            let current = false;
            if (panel.viewKey === this.viewKey &&
                panel.playKey === this.playKey) {
                current = true;
            }
            return current;
        }

        /**
         * Toggle display theme
         */
        toggleAndonTheme(sequence) {
            this.darkTheme = !this.darkTheme;
            sequence.theme = this.darkTheme ? 'dark' : 'light';
            this.updatePanelSequence(sequence);
        }

        /**
         * Edit sequence message
         */
        togglePanelChart(sequence, panel) {
            panel.chart = !panel.chart;
            this.updatePanelSequence(sequence);
        }

        /**
         * Edit sequence message
         */
        editPanelDetail(ev, seqIndex: number, index: number, sequence: number, editKey: string) {
            ev.stopPropagation();
            this.stopSequence();
            this.setKey(sequence, index);
            this.editing = true;

            this.$mdDialog.show({
                controller: ['$scope', '$mdDialog', 'sequence', ($scope, $mdDialog, sequence) => {
                    $scope.sequence = sequence;
                    $scope.panel = sequence.panels[index];
                    $scope.editKey = editKey;

                    $scope.timeUnitChoices = [
                        {key: 'm', value: 'Minutes'},
                        {key: 'h', value: 'Hours'},
                    ];

                    $scope.closeDialog = function () {
                        $scope.editing = false;
                        $mdDialog.hide();
                    };

                    $scope.confirmMessage = function () {
                        $scope.closeDialog();
                    };
                }],
                template: `<md-dialog class="dialog-andon-message">
                    <md-dialog-content class="pt-16 ph-16">
                    <div ng-if="editKey==='message'">
                        <div layout="row">
                            <md-input-container class="md-block" flex="100">
                            <label>Panel Title</label>
                            <input name="title" ng-model="panel.title" md-autofocus md-select-on-focus />
                            </md-input-container>
                        </div>
                        <div layout="row">
                            <md-input-container class="md-block" flex="100">
                            <label>Panel Message</label>
                            <textarea class="text-mono" md-no-autogrow="true" style="min-height: 174px;" name="message" rows="6" ng-model="panel.message"></textarea>
                            </md-input-container>
                        </div>
                    </div>
                    <div ng-if="editKey==='shiftRun'">
                        <div layout="row">
                            <md-input-container class="md-block" flex="100">
                                <label>Run Time Unit</label>
                                <md-select ng-Model="panel.shiftRun_RunTimeUnit">
                                    <md-option ng-repeat="choice in timeUnitChoices" value="{{choice.key}}">{{choice.value}}</md-option>
                                </md-select>
                            </md-input-container>
                        </div>
                        <div layout="row">
                            <md-switch ng-model="panel.shiftRun_ShowThroughput" aria-label="Show Throughput">
                                Show Throughput
                            </md-switch>                    
                        </div>
                        <div layout="row">
                            <md-input-container class="md-block" flex="100">
                                <label>Throughput Time Unit</label>
                                <md-select ng-Model="panel.ShiftRun_throughputTimeUnit">
                                <md-option ng-repeat="choice in timeUnitChoices" value="{{choice.key}}">{{choice.value}}</md-option>
                                </md-select>
                            </md-input-container>
                        </div>
                    </div>
                    </md-dialog-content>
                    <md-dialog-actions class="ph-16 pb-8">
                    <md-button ng-click="closeDialog()" aria-label="Close Dialog" class="secondary-text">
                        Cancel
                    </md-button>
                    <md-button aria-label="Checkout" ng-click="confirmMessage()" class="grey-700-bg white-fg md-raised">
                        Save
                    </md-button>
                    </md-dialog-actions></md-dialog
                >`,
                parent: angular.element("body"),
                targetEvent: ev,
                clickOutsideToClose: false,
                preserveScope: true,
                locals: {
                    sequence: this.andonSequences[seqIndex],
                },
            }).then(() => {
                this.updatePanelSequence(sequence);
                this.startSequence(sequence, index);
            });
        }

        /**
         * Add new panel to sequence
         */
        addNewPanel(event, index, newViewKey) {

            let l = this.andonSequences[index].panels.length;
            let duration = l > 0 ? this.andonSequences[index].panels[l - 1].duration : '4';

            if (newViewKey === 'message') {
                this.andonSequences[index].panels.push({
                    'viewKey': 'message',
                    'duration': duration,
                    'title': 'Message',
                    'message': '',
                    'playKey': l.toString()
                });
                this.updatePanelSequence(this.andonSequences[index]);
                this.editPanelDetail(event, index, l, this.andonSequences[index], 'message');
                return;
            }

            this.andonSequences[index].panels.push({
                'viewKey': newViewKey,
                'duration': duration,
                'chart': false,
                'playKey': l.toString()
            });

            this.updatePanelSequence(this.andonSequences[index]);
        }

        /**
         * Update panel sequence
         */
        updatePanelSequence(sequence) {
            sequence.panels.forEach((item, index) => {
                item.playKey = index.toString();
            });
            if (!sequence.panels) {
                this.initKey();
            }
            this.api.andon.sequences.save(sequence);
        }

        /**
         * Delete panel sequence
         */
        deletePanelSequence(sequence, index) {
            this.api.andon.sequence.delete({ id: sequence.id }, () => {
                this.andonSequences.splice(index, 1);
            });
            this.initKey();
        }

        /**
         * Add new panel sequence
         */
        addNewSequence() {
            // Note that if you pass in your own defaults here they will be used.
            // If you don't, defaults will be provided.
            let defaultNewSequence = {
                name: 'Andon Display ' + (this.andonSequences.length + 1),
                theme: 'dark',
                panels: []
            };

            this.api.andon.sequences.save(defaultNewSequence, (sequence) => {
                // Sometimes the signalr returns the update _faster_ than the save
                // api call that created it!
                const index = this.andonSequences.findIndex(x => x.id === sequence.id);
                if (index)
                    this.andonSequences[index] = sequence;
                else
                    this.andonSequences.push(sequence);
            });
        }

        /**
         * Select input text on click/focus
         */
        focusSelect(form) {
            let input = form.$editables[0].inputEl;
            setTimeout(() => {
                input.select();
            }, 0);
            this.stopSequence();
        }

        onPanelClicked(e) {
            e.stopPropagation()
            this.stopSequence();
        }

        onPanelSaved(form, sequence) {
            form.$submit();
            this.updatePanelSequence(sequence)
        }

    }],
};

export default Wallboard;

EditWallboardController.$inject = ['$mdDialog', 'machines', 'sequences', 'device', 'metrics', 'ranges']
function EditWallboardController($mdDialog, machines, sequences, device, metrics, ranges) {
    let vm = this;
    vm.displayTypes = ['NoContent', 'Andon', 'Message', 'ExternalUrl', 'Warehouse', 'ProductionSummary']; // todo: warehouse only if claim exists
    vm.themes = [
        {
            displayName: "Light",
            value: "light"
        },
        {
            displayName: "Dark",
            value: "dark"
        }
    ];
    vm.machines = machines.map(m => ({machineNumber: m.machineNumber, description: m.description}));
    vm.sequences = sequences;
    vm.selectedDevice = device;
    vm.selectedType = device.contentType;
    vm.selectedMachine = device.contentParams.MachineNumber ? Number(device.contentParams.MachineNumber) : -1;
    vm.selectedSequence = device.contentParams.AndonSequenceId;
    vm.showSchedule = device.contentParams.ShowSchedule?.toLowerCase() !== 'false';
    vm.selectedExternalUrl = device.contentParams.ExternalUrl || '';
    vm.message = device.contentParams.Message;
    vm.selectedTheme = device.contentParams.Theme || 'dark';
    vm.metrics = _.cloneDeep(metrics);
    vm.allMetricsItem = { field: 'All', isChecked: false };
    vm.selectedMetricsNum = 0;
    vm.selectedMachines = [];

    vm.ranges = _.cloneDeep(ranges);
    vm.allRangesItem = { field: 'All', isChecked: false };
    vm.selectedRangesNum = 0;
    console.log('11111122222', device, machines);

    vm.cycleSeconds = 10;

    vm.onClickMetricMenuItem = item => {
      //still needs to adjust visable list
      if (item.field === 'All') {
        vm.allMetricsItem.isChecked = !vm.allMetricsItem.isChecked;
        vm.checkedAllMetrics(vm.allMetricsItem.isChecked);
      } else {
        item.isChecked = !item.isChecked;
        if (item.isChecked) {
          vm.selectedMetricsNum++;
        } else {
          vm.selectedMetricsNum--;
        }

        vm.allMetricsItem.isChecked =
          vm.selectedMetricsNum === vm.metrics.length;
      }
      // vm.reportFilterSubject$.onNext({
      //   machines: vm.machines
      //     .filter(x => x.isChecked)
      //     .map(m => m.machineNumber),
      // });
    };

    vm.isAllMetricsIndeterminate = () => {
      if (
        vm.selectedMetricsNum > 0 &&
        vm.selectedMetricsNum < vm.metrics.length
      ) {
        return true;
      }

      return false;
    };

    vm.checkedAllMetrics = flag => {
      vm.metrics.map(m => {
        m.isChecked = flag;
      });
      if (flag) {
        vm.selectedMetricsNum = vm.metrics.length;
      } else {
        vm.selectedMetricsNum = 0;
      }
    };

    vm.onClickRangeMenuItem = item => {
      //still needs to adjust visable list
      if (item.field === 'All') {
        vm.allRangesItem.isChecked = !vm.allRangesItem.isChecked;
        vm.checkedAllRanges(vm.allRangesItem.isChecked);
      } else {
        item.isChecked = !item.isChecked;
        if (item.isChecked) {
          vm.selectedRangesNum++;
        } else {
          vm.selectedRangesNum--;
        }

        vm.allRangesItem.isChecked =
          vm.selectedRangesNum === vm.ranges.length;
      }
    };

    vm.isAllRangesIndeterminate = () => {
      if (
        vm.selectedRangesNum > 0 &&
        vm.selectedRangesNum < vm.ranges.length
      ) {
        return true;
      }

      return false;
    };

    vm.checkedAllRanges = flag => {
      vm.ranges.map(m => {
        m.isChecked = flag;
      });
      if (flag) {
        vm.selectedRangesNum = vm.ranges.length;
      } else {
        vm.selectedRangesNum = 0;
      }
    };

    vm.getDisableState = function () {
        if (!vm.selectedDevice.wallboardDeviceName) {
            return true;
        }
        if (vm.selectedType === 'Andon') {
            return !vm.selectedMachine || !vm.selectedSequence;
        }

        if (vm.selectedType === 'ExternalUrl') {
            return !vm.selectedExternalUrl;
        }

        if (vm.selectedType === 'Message') {
            return !vm.message;
        }

        return false;
    }

    vm.cancel = function () {
        $mdDialog.cancel();
    };

    vm.onRemoveItem = (item) => {
      item.isChecked = false;
    }

    vm.saveWallboard = function () {
        let contentParams = {};
        switch (vm.selectedType) {
            case 'Andon': {
                contentParams = {
                    MachineNumber: vm.selectedMachine,
                    AndonSequenceId: vm.selectedSequence,
                    ShowSchedule: vm.showSchedule ? 'true' : 'false',
                    Theme: vm.selectedTheme
                };
                break;
            }
            case 'ExternalUrl': {
                contentParams = {
                    ExternalUrl: vm.selectedExternalUrl
                };
                break;
            }
            case 'Message': {
                contentParams = {
                    Message: vm.message,
                    Theme: vm.selectedTheme
                };
                break;
            }
            case 'ProductionSummary': {
               const checkedMetrics = vm.metrics.filter(m => m.isChecked).map(m => m.field);
               const checkedRanges = vm.ranges.filter(m => m.isChecked).map(m => m.field);
               contentParams = {
                   machines: vm.selectedMachines,
                   metrics: checkedMetrics,
                   ranges: checkedRanges,
                   Theme: vm.selectedTheme
               };
               break;
           }
        }

        const newDevie = {
            ...device,
            contentType: vm.selectedType,
            contentParams
        };
        $mdDialog.hide(newDevie);

    }
}
