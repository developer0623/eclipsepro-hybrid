import * as _ from 'lodash';
import dc, { RowChart } from 'dc';
// import * as d3 from 'd3';
declare let d3: any

import ParetoTemp from './dc-pareto-chart.component.html';

const DcParetoChart = {
    selector: 'dcParetoChart',
    bindings: {
        dimension: '<',
        group: '<',
        topCount: '<',
        valueProperty: '@',
        chartTitle: '@',
        height: '@'
    },
    // Load the template
    template: ParetoTemp,
    controller: ['$element', function ($element) {
        let self = this;
        this.$onInit = function () {
            switch (self.valueProperty) {
                case 'durationMinutes':
                case 'allDownMinutes':
                    self.titleUnits = ' minutes';
                    break;
                case 'goodFt':
                case 'goodLocal':
                case 'scrapLengthFt':
                case 'scrapLengthLocal':
                    self.titleUnits = ' feet'; // todo: localize
                    break;
                case 'oeePercent':
                case 'targetPercent':
                    self.titleUnits = ' %';
                    break;
            }
        }

        $element.ready(() => {
            self.options = {
                dimension: self.dimension,
                group: self.group,
                charttitle: self.chartTitle,
                width: $element[0].clientWidth - 24,
                height: self.height,
                margins: {
                    top: 5,
                    left: 10,
                    right: 10,
                    bottom: 20
                },
                gap: 2,
                elasticX: true,
                ordinalColors: ['#3182bd'],
                label: (d) => {
                    return d.key;
                },
                ordering: d => d * -1,
                cap: self.topCount
            };
        })

        self.postSetup = (chart: RowChart) => {
            chart.xAxis().tickFormat(d3.format('.2s'));

            // t is of type {key,value}, not string. The @types package is wrong.
            chart.title(t => d3.format(',.0f')((<unknown>t as { key, value }).value) + self.titleUnits);

            //                // Replace the built in `othersGrouper` with our own because the built in
            //                // does not create a final record in the same shape as the crossfilter
            //                // does.
            //                chart.othersGrouper((topRows) => {
            //                  let topRowsSum = d3.sum(topRows, chart.valueAccessor()),
            //                    allRows = chart.group().all(),
            //                    allRowsSum = d3.sum(allRows, chart.valueAccessor()),
            //                    topKeys = topRows.map(chart.keyAccessor()),
            //                    allKeys = allRows.map(chart.keyAccessor()),
            //                    topSet = d3.set(topKeys),
            //                    others = allKeys.filter(function(d) { return !topSet.has(d); });
            //                  if (allRowsSum > topRowsSum) {
            //                    let otherSumValue = allRowsSum - topRowsSum;
            //                    let otherSumRecord = {
            //                      'others': others,
            //                      'key': 'Others',
            //                      value: { }
            //                    };
            //                    otherSumRecord.value[scope.valueProperty] = otherSumValue;
            //                    return topRows.concat([otherSumRecord]);
            //                  }
            //                  return topRows;
            //                });

            self.resetFilters = () => {
                chart.filterAll();
                dc.redrawAll();
            };
        };
    }],
    controllerAs: '$ctrl'
};

export default DcParetoChart;
