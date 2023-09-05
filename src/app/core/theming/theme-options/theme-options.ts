(function ()
{
    'use strict';

    angular
        .module('app.core')
        .controller('ThemeOptionsController', ThemeOptionsController);

    /** @ngInject */
    function ThemeOptionsController(eclipseProTheming)
    {
        let vm = this;

        // Data
        vm.panelOpen = false;
        vm.themes = eclipseProTheming.themes;
        vm.layoutMode = 'wide';

        // Methods
        vm.toggleOptionsPanel = toggleOptionsPanel;
        vm.setActiveTheme = setActiveTheme;
        vm.updateLayoutMode = updateLayoutMode;

        //////////

        /**
         * Toggle options panel
         */
        function toggleOptionsPanel()
        {
            vm.panelOpen = !vm.panelOpen;
        }

        /**
         * Set active theme
         *
         * @param themeName
         */
        function setActiveTheme(themeName)
        {
            // Set active theme
            eclipseProTheming.setActiveTheme(themeName);
        }

        /**
         * Update layout mode
         */
        function updateLayoutMode()
        {
            let bodyEl = angular.element('body');

            // Update class on body element
            bodyEl.toggleClass('boxed', (vm.layoutMode === 'boxed'));
        }
    }
})();