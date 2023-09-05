import angular from 'angular';

themeConfig.$inject = ['$mdThemingProvider','eclipseProPalettes', 'eclipseProThemes', 'eclipseProThemingProvider'];
export function themeConfig($mdThemingProvider, eclipseProPalettes, eclipseProThemes, eclipseProThemingProvider)
    {
        // Inject Cookies Service
        let $cookies;
        angular.injector(['ngCookies']).invoke([
            '$cookies', function (_$cookies)
            {
                $cookies = _$cookies;
            }
        ]);

        // Check if custom theme exist in cookies
        let customTheme = $cookies.getObject('customTheme');
        if ( customTheme )
        {
            eclipseProThemes['custom'] = customTheme;
        }

        $mdThemingProvider.alwaysWatchTheme(true);

        // Define custom palettes
        angular.forEach(eclipseProPalettes, function (palette)
        {
            $mdThemingProvider.definePalette(palette.name, palette.options);
        });

        // Register custom themes
        angular.forEach(eclipseProThemes, function (theme, themeName)
        {
            $mdThemingProvider.theme(themeName)
                .primaryPalette(theme.primary.name, theme.primary.hues)
                .accentPalette(theme.accent.name, theme.accent.hues)
                .warnPalette(theme.warn.name, theme.warn.hues)
                .backgroundPalette(theme.background.name, theme.background.hues);
        });

        // Store generated PALETTES and THEMES objects from $mdThemingProvider
        // in our custom provider, so we can inject them into other areas
        eclipseProThemingProvider.setRegisteredPalettes($mdThemingProvider._PALETTES);
        eclipseProThemingProvider.setRegisteredThemes($mdThemingProvider._THEMES);
    }
