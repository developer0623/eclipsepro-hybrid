const UserSettings_ = {
    selector: 'userSettings',
    bindings: {},
    template: `
        <div id="settings" class="page-layout simple fullwidth">
            <div class="header">
                <div layout="row" layout-align="space-between">
                    <span class="h2">User: {{$ctrl.userName}}</span>
                </div>
            </div>
            <div class="content" md-background-bg>
                <user-profile username="$ctrl.userName"></user-profile>
            </div>
        </div>
            `,
    /** @ngInject */
    controller: ['$stateParams', class UserSettingsComponent {
        userName = "";
        constructor($stateParams) {
            this.userName = $stateParams.userName;

        }
    }],
};

export default UserSettings_;
