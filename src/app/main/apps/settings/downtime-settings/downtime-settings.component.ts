import Temp from './downtime-settings.html';

const DowntimeSettings_ = {
    selector: 'downtimeSettings',
    bindings: {},
    template: Temp,
    /** @ngInject */
    controller: ['api', class DowntimeSettingsComponent {
        api_;
        downtimeCodes = [];
        downtimeCodeCategories = [];
        constructor(api) {
            this.api_ = api;
            api.settings.downtimeCodes.query().$promise.then(r => {
                this.downtimeCodes = r;
            });
            api.settings.downtimeCodeCategories.query().$promise.then(r => {
                this.downtimeCodeCategories = r;
            });
        }

        setCodeCategory(code, category) {
            code.category = category.value;
            this.api_.settings.downtimeCodes.save(code).$promise.then(console.log);
        }
    }],
};

export default DowntimeSettings_;
