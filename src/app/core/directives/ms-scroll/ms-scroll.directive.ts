import angular from 'angular';
import * as PerfectScrollbar from 'perfect-scrollbar';

const msScrollDirective: any = ($timeout, msScrollConfig, eclipseProConfig, eclipseProHelper) => {
    return {
        restrict: 'AE',
        compile : function (tElement)
        {
            // Do not replace scrollbars if
            // 'disableCustomScrollbars' config enabled
            if ( eclipseProConfig.getConfig('disableCustomScrollbars') )
            {
                return false;
            }

            // Do not replace scrollbars on mobile devices
            // if 'disableCustomScrollbarsOnMobile' config enabled
            if ( eclipseProConfig.getConfig('disableCustomScrollbarsOnMobile') && eclipseProHelper.isMobile() )
            {
                return false;
            }

            // Add class
            tElement.addClass('ms-scroll');

            return function postLink(scope, iElement, iAttrs)
            {
                let options = {};

                // If options supplied, evaluate the given
                // value. This is because we don't want to
                // have an isolated scope but still be able
                // to use scope variables.
                // We don't want an isolated scope because
                // we should be able to use this everywhere
                // especially with other directives
                if ( iAttrs.msScroll )
                {
                    options = scope.$eval(iAttrs.msScroll);
                }

                // Extend the given config with the ones from provider
                options = angular.extend({}, msScrollConfig.getConfig(), options);

                // Initialize the scrollbar
                $timeout(function ()
                {
                    PerfectScrollbar.initialize(iElement[0], options);
                }, 0);

                // Update the scrollbar on element mouseenter
                iElement.on('mouseenter', updateScrollbar);

                // Watch scrollHeight and update
                // the scrollbar if it changes
                scope.$watch(function ()
                {
                    return iElement.prop('scrollHeight');
                }, function (current, old)
                {
                    if ( angular.isUndefined(current) || angular.equals(current, old) )
                    {
                        return;
                    }

                    updateScrollbar();
                });

                // Watch scrollWidth and update
                // the scrollbar if it changes
                scope.$watch(function ()
                {
                    return iElement.prop('scrollWidth');
                }, function (current, old)
                {
                    if ( angular.isUndefined(current) || angular.equals(current, old) )
                    {
                        return;
                    }

                    updateScrollbar();
                });

                /**
                 * Update the scrollbar
                 */
                function updateScrollbar()
                {
                    PerfectScrollbar.update(iElement[0]);
                }

                // Cleanup on destroy
                scope.$on('$destroy', function ()
                {
                    iElement.off('mouseenter');
                    PerfectScrollbar.destroy(iElement[0]);
                });

                return;
            };
        }
    };
}

function msScrollConfigProvider() {
    // Default configuration
    let defaultConfiguration = {
        wheelSpeed            : 1,
        wheelPropagation      : false,
        swipePropagation      : true,
        minScrollbarLength    : null,
        maxScrollbarLength    : null,
        useBothWheelAxes      : false,
        useKeyboard           : true,
        suppressScrollX       : false,
        suppressScrollY       : false,
        scrollXMarginOffset   : 0,
        scrollYMarginOffset   : 0,
        stopPropagationOnClick: true
    };

    // Methods
    this.config = config;

    //////////

    /**
     * Extend default configuration with the given one
     *
     * @param configuration
     */
    function config(configuration)
    {
        defaultConfiguration = angular.extend({}, defaultConfiguration, configuration);
    }

    /**
     * Service
     */
    this.$get = function ()
    {
        let service = {
            getConfig: getConfig
        };

        return service;

        //////////

        /**
         * Return the config
         */
        function getConfig()
        {
            return defaultConfiguration;
        }
    };
    return this;
}

export default angular
    .module('app.core.directives.msScroll', [])
    .provider('msScrollConfig', [msScrollConfigProvider])
    .directive('msScroll', ['$timeout', 'msScrollConfig', 'eclipseProConfig', 'eclipseProHelper', msScrollDirective])
    .name;
