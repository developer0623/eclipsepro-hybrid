import angular from 'angular';

export function eclipseProThemingProvider() {
    // Inject Cookies Service
    let $cookies;

    angular.injector(['ngCookies']).invoke([
        '$cookies', function (_$cookies)
        {
            $cookies = _$cookies;
        }
    ]);

    let registeredPalettes,
        registeredThemes;

    // Methods
    this.setRegisteredPalettes = setRegisteredPalettes;
    this.setRegisteredThemes = setRegisteredThemes;

    //////////

    /**
     * Set registered palettes
     *
     * @param _registeredPalettes
     */
    function setRegisteredPalettes(_registeredPalettes)
    {
        registeredPalettes = _registeredPalettes;
    }

    /**
     * Set registered themes
     *
     * @param _registeredThemes
     */
    function setRegisteredThemes(_registeredThemes)
    {
        registeredThemes = _registeredThemes;
    }

    /**
     * Service
     */
    this.$get = function ()
    {
        let service = {
            getRegisteredPalettes: getRegisteredPalettes,
            getRegisteredThemes  : getRegisteredThemes,
            setActiveTheme       : setActiveTheme,
            setThemesList        : setThemesList,
            themes               : {
                list  : {},
                active: {
                    'name' : '',
                    'theme': {}
                }
            }
        };

        return service;

        //////////

        /**
         * Get registered palettes
         *
         * @returns {*}
         */
        function getRegisteredPalettes()
        {
            return registeredPalettes;
        }

        /**
         * Get registered themes
         *
         * @returns {*}
         */
        function getRegisteredThemes()
        {
            return registeredThemes;
        }

        /**
         * Set active theme
         *
         * @param themeName
         */
        function setActiveTheme(themeName)
        {
            // If theme does not exist, fallback to the default theme
            if ( angular.isUndefined(service.themes.list[themeName]) )
            {
                // If there is no theme called "default"...
                if ( angular.isUndefined(service.themes.list['default']) )
                {
                    console.error('You must have at least one theme named "default"');
                    return;
                }

                console.warn('The theme "' + themeName + '" does not exist! Falling back to the "default" theme.');

                // Otherwise set theme to default theme
                service.themes.active.name = 'default';
                service.themes.active.theme = service.themes.list['default'];
                $cookies.put('selectedTheme', service.themes.active.name);

                return;
            }

            service.themes.active.name = themeName;
            service.themes.active.theme = service.themes.list[themeName];
            $cookies.put('selectedTheme', themeName);
        }

        /**
         * Set available themes list
         *
         * @param themeList
         */
        function setThemesList(themeList)
        {
            service.themes.list = themeList;
        }
    };
    return this;
}