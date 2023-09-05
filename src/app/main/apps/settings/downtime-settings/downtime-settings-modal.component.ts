import Temp from './downtime-settings-modal.html';
const DowntimeSettingsModal_ = {
    selector: 'downtimeSettingsModal',
    bindings: {},
    template: Temp,
    /** @ngInject */
    controller: ['api', '$mdDialog', class DowntimeSettingsModalComponent {
        api_;
        mdDialog_;
        downtimeCodes = [];
        downtimeCodeCategories = [];
        constructor(api, $mdDialog) {
            this.api_ = api;
            this.mdDialog_ = $mdDialog;
            api.settings.downtimeCodes.query().$promise.then(r => {
                this.downtimeCodes = r;
            });
            api.settings.downtimeCodeCategories.query().$promise.then(r => {
                this.downtimeCodeCategories = r;
            })
        }

        setCodeCategory(code, category) {
            code.category = category.value;
            this.api_.settings.downtimeCodes.save(code).$promise.then(console.log);
        };
        cancel() {
            this.mdDialog_.hide('cancel');
        };
    }]
};

export default DowntimeSettingsModal_;
