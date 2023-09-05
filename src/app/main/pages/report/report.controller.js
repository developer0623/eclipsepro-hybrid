(function ()
{
    'use strict';

    angular
        .module('app.pages.report')
        .controller('ReportController', ReportController);

    /** @ngInject */
    function ReportController(Report)
    {
        var vm = this;

        // Data
        vm.report = Report.data;

        // Methods

        //////////
    }
})();
