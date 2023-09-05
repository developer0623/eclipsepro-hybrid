import Temp from './update.html';

const UpdateSettings_ = {
    selector: 'updateSettings',
    bindings: {},
    template: Temp,
    /** @ngInject */
    controller: ['systemInfoService', class UpdateSettingsComponent {
        systemInfo;
        constructor(systemInfoService) {
            this.systemInfo = systemInfoService;

        }
    }],
};

export default UpdateSettings_;
