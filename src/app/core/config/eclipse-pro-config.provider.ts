import angular from 'angular';
export function eclipseProConfigProvider() {
    // Default configuration
    let eclipseProConfiguration = {
        'disableCustomScrollbars': false,
        'disableMdInkRippleOnMobile': true,
        'disableCustomScrollbarsOnMobile': true
    };

    // Methods
    this.config = config;

    //////////

    /**
     * Extend default configuration with the given one
     *
     * @param configuration
     */
    function config(configuration) {
        eclipseProConfiguration = angular.extend({}, eclipseProConfiguration, configuration);
    }

    /**
     * Service
     */
    this.$get = function () {
        let service = {
            getConfig: getConfig,
            setConfig: setConfig
        };

        return service;

        //////////

        /**
         * Returns a config value
         */
        function getConfig(configName) {
            if (angular.isUndefined(eclipseProConfiguration[configName])) {
                return false;
            }

            return eclipseProConfiguration[configName];
        }

        /**
         * Creates or updates config object
         *
         * @param configName
         * @param configValue
         */
        function setConfig(configName, configValue) {
            eclipseProConfiguration[configName] = configValue;
        }
    };
}