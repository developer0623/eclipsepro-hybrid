configTypeFilter.$inject = ['integrationConfigService']
export function configTypeFilter(integrationConfigService) {
   return function (type: string, configField: string) {
      const config = integrationConfigService.getConfigs(configField);
      if(config && config[type]) {
      return config[type].name;
      }

      return type;
   };
}
