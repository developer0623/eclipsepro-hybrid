import angular from 'angular';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { Put } from "../../../../core/services/clientData.actions";
import * as _ from 'lodash';
import { Ams } from '../../../../amsconfig';
import Temp from './printing.html';
import EditProperyModal from './editPropertyModal/editProperyModal.component';

import { IMachinePrintConfig, IInstalledPrinters, IRecentBundleResult } from '../../../../core/dto';

const Printing = {
    selector: 'printing',
    template: Temp,
    bindings: {},
    /** @ngInject */
    controller: ['$scope', '$mdToast', 'api', 'clientDataStore', '$mdDialog', '$location', '$http', class PrintingComponent {
        installedPrinters: IInstalledPrinters = { printers: [] };
        allPrinters: {
            id: string;
            name: string;
            fullName: string;
            description: string;
        }[];
        printTemplates = [];
        machinePrintConfigs: (IMachinePrintConfig & { machineName: string })[] = [];
        selectedTabIndex = 0;
        bundlePrintConfig = {
            bundleTagEnabled: false,
            bundleTagProperties: {},
            bundleTagStartingDate: new Date(),
        };
        coilPrintConfig = {
            coilTagEnabled: false,
            coilTagProperties: {},
            coilTagStartingDate: new Date(),
        };
        files = [];
        recentBundles: IRecentBundleResult[];
        bundleCompletionAlgorithms = ['None', 'Job', 'Controller'].map(x => ({
            title: x,
            translationKey: 'BundleCompletionAlgorithm' + x,
        }));

        loading = false;
        hideComplete = false;
        selectTab() {
            this.$location.search({ tab: this.selectedTabIndex });
        }

        constructor(
            private $scope: angular.IScope,
            private $mdToast,
            private api,
            private clientDataStore: ClientDataStore,
            private $mdDialog,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService
        ) {
            let qs = $location.search();
            if ('tab' in qs) {
                this.selectedTabIndex = parseInt(qs.tab);
            }

            let NOTEMPTY = (x: []) => x.length > 0;

            const updateAllPrinters = () => {
                const unknownPrinters = this.machinePrintConfigs
                    .filter(
                        machine =>
                            // Has a configured printer...
                            machine.bundlePrinterName &&
                            // ...but said printer is not in our list.
                            !this.installedPrinters.printers.find(
                                p => p.fullName === machine.bundlePrinterName
                            )
                    )
                    .map(p => {
                        return {
                            id: p.bundlePrinterName,
                            name: 'Error:' + p.bundlePrinterName,
                            fullName: p.bundlePrinterName,
                            description: '<not installed>',
                        };
                    })
                    // Removes duplicate entries. Like a distinct.
                    .filter((value, index, self) => self.findIndex(v=>v.name === value.name) === index);

                this.allPrinters = unknownPrinters.concat(
                    this.installedPrinters.printers
                );
            };

            let printTemplatesSub_ = clientDataStore
                .SelectPrintTemplates()
                .subscribe(templates => {
                    this.printTemplates = templates.map(t => ({
                        ...t,
                        previewUrl:
                            '/_api/printing/printTemplates/' +
                            t.name +
                            '/preview?output=png&cachebuster=' +
                            (Math.random() * 1000).toString(),
                    }));
                });
            let machinePrintConfigsSub_ = Rx.Observable.combineLatest(
                clientDataStore.SelectMachinePrintConfigs().filter(NOTEMPTY),
                clientDataStore.SelectMachines().filter(NOTEMPTY),
                (machineConfigs, machines) => {
                    return { machineConfigs, machines };
                }
            ).subscribe(({ machineConfigs, machines }) => {
                this.machinePrintConfigs = machines.map(machine => {
                    let printConfig = machineConfigs.find(mp => mp.id === machine.id);
                    return Object.assign({}, printConfig, {
                        machineName: machine.description,
                    });
                });
                updateAllPrinters();
            });

            let installedPrintersSub_ = clientDataStore
                .SelectInstalledPrinters()
                .subscribe(printers => {
                    this.installedPrinters = printers;
                    updateAllPrinters();
                });

            let bundlesSub_ = clientDataStore
                .SelectRecentBundles()
                .subscribe(recentBundles => {
                    this.recentBundles = _.orderBy(
                        recentBundles,
                        ['complete', 'endTime'],
                        ['desc', 'desc']
                    );
                });

            $scope.$on('$destroy', () => {
                printTemplatesSub_.dispose();
                machinePrintConfigsSub_.dispose();
                installedPrintersSub_.dispose();
                bundlesSub_.dispose();
            });

            this.getBundlePrintConfig();
            this.getCoilPrintConfig();
        }

        private getBundlePrintConfig() {
            this.api.printing.bundlePrintConfig.get(
                {},
                data => {
                    this.bundlePrintConfig = data;
                },
                error => {
                    console.log(error);
                }
            );
        }
        private getCoilPrintConfig() {
            this.api.printing.coilPrintConfig.get(
                {},
                data => {
                    this.coilPrintConfig = data;
                },
                error => {
                    console.log(error);
                }
            );
        }
        private toastForm = (message: string) =>
            this.$mdToast
                .simple()
                .textContent(message)
                .position('top right')
                .hideDelay(2000)
                .parent('#content');

        private saveError(error) {
            console.error(error);
            this.$mdToast.show(this.toastForm('Unable to save settings'));
        }

        private saveBundleConfigSuccess(data: any) {
            this.bundlePrintConfig = data;
            this.$mdToast.show(this.toastForm('Settings updated'));
        }

        saveBundleTagEnabled() {
            this.api.printing.bundlePrintConfig.save(
                { bundleTagEnabled: this.bundlePrintConfig.bundleTagEnabled },
                this.saveBundleConfigSuccess,
                this.saveError
            );
        }

        setBundleCompletionAlgorithm(algorithm) {
            this.api.printing.bundlePrintConfig.save(
                { source: algorithm.title },
                this.saveBundleConfigSuccess,
                this.saveError
            );
        }
        saveCoilConfigSuccess(data) {
            this.coilPrintConfig = data;
            this.$mdToast.show(this.toastForm('Settings updated'));
        }
        saveCoilTagEnabled() {
            this.api.printing.coilPrintConfig.save(
                { coilTagEnabled: this.coilPrintConfig.coilTagEnabled },
                this.saveCoilConfigSuccess,
                this.saveError
            );
        }
        saveBundlePrintStartDate() {
            this.api.printing.bundlePrintConfig.save(
                { startingDate: this.bundlePrintConfig.bundleTagStartingDate },
                this.saveBundleConfigSuccess,
                this.saveError
            );
        }
        saveCoilPrintStartDate() {
            this.api.printing.coilPrintConfig.save(
                { coilTagStartingDate: this.coilPrintConfig.coilTagStartingDate },
                this.saveCoilConfigSuccess,
                this.saveError
            );
        }
        updateMachineConfig(config: IMachinePrintConfig) {
            console.log(config);

            this.api.printing.machinePrintConfigs.update(
                { id: config.id },
                config,
                response => {
                    this.$mdToast.show({
                        position: 'bottom right',
                        template:
                            '<md-toast>' +
                            '<span flex>Your changes have been saved.</span>' +
                            '</md-toast>',
                    });
                    return response.data;
                },
                error => {
                    this.$mdToast.show({
                        position: 'bottom right',
                        template:
                            '<md-toast>' +
                            `<span flex>Error! Your changes have not been saved. ${(error.data.errors.reduce((errs, e) => errs + '<br/>' + e), '')
                            }</span>` +
                            '</md-toast>',
                    });
                }
            );
        }

        /**
         * Select input text on click/focus
         */
        focusSelect(form) {
            let input = form.$editables[0].inputEl;
            setTimeout(() => {
                input.select();
            }, 0);
        }

        filterHideComplete(item: { complete: boolean }) {
            return !this.hideComplete || !item.complete;
        }

        onTemplateUpload(templateFileElementId) {
            const templatePkgFile = document.getElementById(
                templateFileElementId
            ) as HTMLInputElement;

            if (templatePkgFile.files.length === 0) {
                this.toast('No template file was selected.');
                return;
            }

            let payload = new FormData();
            payload.append('file', templatePkgFile.files[0]);

            this.$http({
                // Per https://stackoverflow.com/a/37414923/947
                url: `${Ams.Config.BASE_URL}/_api/printing/printTemplates`,
                method: 'PUT',
                data: payload,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity,
            })
                .then(_ => {
                    this.api.printing.printTemplates.get(
                        data => {
                            data.forEach(x =>
                                this.clientDataStore.Dispatch(new Put('PrintTemplates', x))
                            );
                        },
                        error =>
                            this.toast('Unable to refresh the template data. \n' + error.data)
                    );
                    return this.toast('Template successfully added.');
                })
                .catch(reason =>
                    this.toast(
                        'Template import failed.\n' + reason.data.errors.join('\n')
                    )
                );
        }
        private toast(textContent: string): any {
            return this.$mdToast.show(
                this.$mdToast
                    .simple()
                    .textContent(textContent)
                    .position('top right')
                    .hideDelay(2000)
                    .parent('#content')
            );
        }

        printBundle(bundleCode: string) {
            this.$http<string>({
                url: `${Ams.Config.BASE_URL}/_api/bundle/${bundleCode}/print`,
                method: 'POST',
            })
                .then(result => this.toast(result.data))
                .catch(reason =>
                    this.toast('Print failed.\n' + reason.data.errors.join('\n'))
                );
        }

        isObjectEmpty(obj) {
            return Object.keys(obj).length === 0;
        }

        editProperty(type: string) {
            const properties =
                type === 'coil'
                    ? this.coilPrintConfig.coilTagProperties
                    : this.bundlePrintConfig.bundleTagProperties;
            this.$mdDialog
                .show({
                    ...EditProperyModal,
                    locals: {
                        type,
                        properties,
                    },
                    clickOutsideToClose: true,
                })
                .then(result => {
                    if (result) {
                        if (type === 'coil') {
                            const props = { coilTagProperties: result };
                            this.api.printing.coilPrintConfig.save(
                                props,
                                () => this.$mdToast.show(this.toastForm('Settings updated')),
                                this.saveError
                            );
                            this.coilPrintConfig = {
                                ...this.coilPrintConfig,
                                ...props,
                            };
                        } else {
                            const props = { bundleTagProperties: result };
                            this.api.printing.bundlePrintConfig.save(
                                props,
                                () => this.$mdToast.show(this.toastForm('Settings updated')),
                                this.saveError
                            );
                            this.bundlePrintConfig = {
                                ...this.bundlePrintConfig,
                                ...props,
                            };
                        }
                    }
                });
        }
    }],
};

export default Printing;
