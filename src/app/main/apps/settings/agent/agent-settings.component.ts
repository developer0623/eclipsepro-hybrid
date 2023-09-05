import Temp from './agent-settings.html';
const AgentSettings = {
  selector: 'agentSettings',
  template: Temp,
  bindings: {},
  /** @ngInject */
  controller: ['systemInfoService', class AgentSettingsComponent {
    constructor(private systemInfoService) {
      this.systemInfoService.refresh();
    }

  }]
};

export default AgentSettings;
