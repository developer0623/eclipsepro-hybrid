(function ()
{
    'use strict';

    angular
        .module('app.pages.report', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider)
    {
        $stateProvider.state('app.pages_report', {
            url    : '/pages/report',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/pages/report/report.html',
                    controller : 'ReportController as vm'
                }
            },
            resolve: {
                Report: function (apiResolver)
                {
                    return apiResolver.resolve('report@get');
                }
            }
        });

        $translatePartialLoaderProvider.addPart('app/main/pages/report');

    }

})();
