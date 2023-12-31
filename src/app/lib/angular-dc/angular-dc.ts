import angular from 'angular';
import * as _ from 'lodash';
import * as dc from 'dc';
// import * as d3 from 'd3';
declare let d3: any

export default angular
    .module('angularDc', [])
    .directive('dcChart', dcChartDirective as any)
    .directive('dcSelect', dcSelectDirective as any)
    .name;

/* The main directive in angularDc, responsible creating Dc.js charts.
       The goal of this directive is to provide a AngularJs interface to
       the existing features of Dc.js.  */

/** @ngInject */
dcChartDirective.$inject = ['$timeout']
function dcChartDirective($timeout) {

    /* Whitelisted options to be read from a chart's html attributes. */
    let directiveOptions = ['name',
        'onRenderlet',
        'onFiltered',
        'onPostRedraw',
        'onPostRender',
        'onPreRedraw',
        'onPreRender',
        'onZoomed',
        'postSetupChart'
    ];


    /* Called during the directive's linking phase, this function creates
   a Dc.js chart. The chart is configured based on settings read from
   the $scope and the html element.
 */

    function setupChart(scope, iElement, iAttrs, options) {

        // Get the element this directive blongs to, the root of chart
        let chartElement = iElement[0],

            // Get the chart type to create
            // Rather than creating a directive for each type of chart
            // we take it as our main parameter, and use that to call the correct Dc.js
            // chart constructor
            chartType = iAttrs.dcChart,

            // Get the Dc.js 'Chart Group', if any, for this chart.
            // Charts within a group are tied together
            chartGroupName = iAttrs.dcChartGroup || undefined;

        // Get the chart creation function for the chartType
        let chartFactory = dc[chartType];

        // Create an unconfigured instance of the chart
        let chart = chartFactory(chartElement, chartGroupName);

        // Get the potential set of options for this chart
        // Used for mapping chartElement's html attributes to chart options
        let validOptions = getValidOptionsForChart(chart);

        // Get additional options from chartElement's html attributes.
        // All options are prepended with 'dc-'' to avoid clashing with html own meaning (e.g width)
        // All options are parsed in angular's $parse language, so beware, it is not javascript!
        options = getOptionsFromAttrs(scope, iAttrs, validOptions);

        // we may have a dc-options attribute which contain a javascript object for stuff
        // not writtable in $parse language
        if ('options' in options) {
            options = _.merge(options, options.options);
            options.options = undefined;
        }
        // If we have a dc-name attribute, we populate the scope with the chart
        // object dc-name
        if ('name' in options) {
            scope[options.name] = chart;
            options.name = undefined;
        }
        // Configure the chart based on options
        chart.options(options);

        // Get event handlers, if any, from options
        let eventHandlers = _({
            'renderlet': options.onRenderlet,
            'preRender': options.onPreRender,
            'postRender': options.onPostRender,
            'preRedraw': options.onPreRedraw,
            'postRedraw': options.onPostRedraw,
            'filtered': options.onFiltered,
            'zoomed': options.onZoomed,
        }).omit(_.isUndefined);

        // Register the eventHandlers with the chart (Dc.js)
        eventHandlers.each(function (handler, evt) {
            chart.on(evt, handler);
        });

        // Run the postSetupChart callback, if provided
        if (_.isFunction(options.postSetupChart)) {
            options.postSetupChart(chart, options);
        }

        return chart;
    }

    function getValidOptionsForChart(chart) {

        // all chart options are exposed via a function
        return _(chart).functions()
            .concat(directiveOptions)
            .map(function (s) {
                return 'dc' + s.charAt(0).toUpperCase() + s.substring(1);
            })
            .value();
    }

    function getOptionsFromAttrs(scope, iAttrs, validOptions) {
        return _(iAttrs.$attr)
            .keys()
            .intersection(validOptions)
            .map(function (key) {
                let value = scope.$eval(iAttrs[key]);
                // remove the dc- prefix if any
                if (key.substring(0, 2) === 'dc') {
                    key = key.charAt(2).toLowerCase() + key.substring(3);
                }
                return [key, value];
            })
            .fromPairs()
            .value();
    }
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            let printExceptions = false;
            // add dc, d3 and commonly used Date method to the scope to allow snippets to be configured in
            // the templates
            scope.dc = dc;
            scope.d3 = d3;
            scope.DateTime = function (a, b, c, d, e, f) {
                return new Date(a, b, c, d, e, f);
            };
            scope.Date = function (a, b, c) {
                return new Date(a, b, c);
            };
            // watch for the scope to settle until all the attributes are defined
            let unwatch = scope.$watch(function () {
                let options = _(iAttrs.$attr)
                    .keys()
                    .filter(function (s) {
                        return s.substring(0, 2) === 'dc' && s !== 'dcChart' && s !== 'dcChartGroup';
                    })
                    .map(function (key) {
                        try {
                            // We ignore exception waiting for the data to be potentially loaded
                            // by the controller
                            let r = scope.$eval(iAttrs[key]);
                            if (_.isUndefined(r)) {
                                throw new Error(iAttrs[key] + ' is undefined');
                            }
                            return r;
                        } catch (e) {
                            if (printExceptions) {
                                console.log('unable to eval' + key + ':' + iAttrs[key]);
                                throw e;
                            }
                            return undefined;
                        }
                    });
                if (options.some(_.isUndefined)) {
                    // return undefined if there is at least one undefined option
                    // so that the $watch dont call us again at this $digest time
                    return undefined;
                }
                return options.value();
            }, function (options) {
                if (!_.isUndefined(options)) {
                    // Stop the $watch, as we now created the charts
                    unwatch();

                    let chart = setupChart(scope, iElement, iAttrs, []);
                    // populate the .reset childrens with necessary reset callbacks
                    let a = angular.element(iElement[0].querySelector('a.reset'));
                    a.on('click', function () {
                        chart.filterAll();
                        if (iAttrs.dcRangeChart) {
                            let rangeChart = scope.$eval(iAttrs.dcRangeChart);
                            rangeChart.filterAll();
                        }
                        dc.redrawAll();
                    });
                    a.attr('href', 'javascript:;');
                    a.css('display', 'none');
                    // watching the attributes is costly, so we stop after first rendering
                    chart.render();
                }
            });
            // if after 4 second we still get exceptions, we should raise them
            // to help debugging. $timeout will trigger another round of check.
            $timeout(function () {
                printExceptions = true;
            }, 2000);

        }
    };

}

/** @ngInject */
function dcSelectDirective() {
    return {
        restrict: 'E',
        scope: {
            dcDimension: '=',
            allLabel: '@'
        },
        template: '<select class="form-control" ng-model="selectModel" ' + 'ng-options="d.key for d in selectOptions">',
        link: function (scope, iElement, iAttrs) {
            scope.$watch('dcDimension', function (dimension) {
                let allkeys, chart;
                if (dimension !== null) {
                    // we make a fake chart so that the dimension is known by dc.filterAll()
                    chart = (dc as any).baseMixin({});
                    chart.dimension(dimension);
                    chart.group(dimension);
                    chart._doRender = function () { };
                    chart._doRedraw = function () { };
                    scope.selectModel = {
                        key: scope.allLabel
                    };
                    allkeys = dimension.group().orderNatural().all();
                    scope.selectOptions = [scope.selectModel].concat(allkeys);
                }
            });
            return scope.$watch('selectModel', function (sel) {
                if (scope.dcDimension !== null) {
                    if (sel !== null && sel.key !== scope.allLabel) {
                        scope.dcDimension.filter(function (d) {
                            return d === sel.key;
                        });
                    } else {
                        scope.dcDimension.filter(null);
                    }
                    dc.redrawAll();
                }
            });
        }
    };
}
