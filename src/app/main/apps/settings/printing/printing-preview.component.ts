import angular from 'angular';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { Put } from "../../../../core/services/clientData.actions";
import * as _ from 'lodash';
import { Ams } from '../../../../amsconfig';
import Temp from './printing-preview.html';
import { IRecentBundleResult } from '../../../../core/dto';

const PrintingPreview = {
    selector: 'printingPreview',
    template: Temp,
    bindings: {},
    /** @ngInject */
    controller: ['$scope', '$mdToast', 'api', 'clientDataStore', '$location', '$http', class PrintingPreviewComponent {
        printTemplates = [];
        selectedTemplate = {name:'', previewUrl:''};
        files = [];
        loading = false;
        //previewBaseUrl = 'http://localhost:8080';
        previewBaseUrl = '';
        recentBundles: IRecentBundleResult[];
        selectedBundleCode = '';

        constructor(
            private $scope: angular.IScope,
            private $mdToast,
            private api,
            private clientDataStore: ClientDataStore,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService
        ) {
            let qs = $location.search();
            if ('template' in qs) {
                this.selectedTemplate = { name: qs['template'], previewUrl: this.generatePreviewUrl(qs['template']) };
            }

            let printTemplatesSub_ = clientDataStore
                .SelectPrintTemplates()
                .subscribe(templates => {
                    this.printTemplates = templates.map(t => ({
                        ...t,
                        previewUrl: this.generatePreviewUrl(t.name)
                        }));
                    if (this.selectedTemplate?.name) {
                        let found = this.printTemplates.findIndex(t=>t.name===this.selectedTemplate.name);
                        if (found > -1) {
                            this.selectedTemplate = this.printTemplates[found];
                        }
                    }
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
                bundlesSub_.dispose();
            });
        }

        private toastForm = (message: string) =>
            this.$mdToast
                .simple()
                .textContent(message)
                .position('top right')
                .hideDelay(2000)
                .parent('#content');

        /**
         * Select input text on click/focus
         */
        focusSelect(form) {
            let input = form.$editables[0].inputEl;
            setTimeout(() => {
                input.select();
            }, 0);
        }

        generatePreviewUrl(templateName: string): string {
            return `${this.previewBaseUrl}/_api/printing/printTemplates/` +
            templateName +
            '/preview?output=png&cachebuster=' +
            (Math.random() * 1000).toString() +
            (this.selectedBundleCode!== ''? `&bundleCode=${this.selectedBundleCode}`:'')
        }

        onUpdatePreview() {
            this.selectedTemplate.previewUrl = this.generatePreviewUrl(this.selectedTemplate.name);
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

        isObjectEmpty(obj) {
            return Object.keys(obj).length === 0;
        }


    }],
};

export default PrintingPreview;
