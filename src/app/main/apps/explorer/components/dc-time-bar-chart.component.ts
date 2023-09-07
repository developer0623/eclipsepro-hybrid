import * as _ from 'lodash';
import dc, { BarChart } from 'dc';
// import * as d3 from 'd3';
declare let d3: any

import TimebarTemp from './dc-time-bar-chart.component.html';

const DcTimeBarChart = {
    selector: 'dcTimeBarChart',
    bindings: {
        dimension: '<',
        group: '<',
        valueProperty: '@',
        chartTitle: '@',
        height: '@'
    },
    // Load the template
    template: TimebarTemp,
    controller: ['$element', function ($element) {
        let self = this;
        $element.ready(() => {
            self.options = {
                dimension: self.dimension,
                group: self.group,
                width: $element[0].clientWidth - 24,
                height: self.height,
                chartTitle: self.chartTitle,
                margins: {
                    top: 10,
                    right: 10,
                    bottom: 20,
                    left: 40
                },
                gap: 1,
                x: d3.time.scale().domain([new Date(2007, 4, 3), new Date(2007, 11, 19)]),
                xUnits: d3.time.days,
                elasticX: true,
                elasticY: true,
                round: d3.time.day.round,
                // dc.js barchart has a known design bug when using dates where
                // the last column doesn't display. This solution is from a
                // dc.js developer. https://stackoverflow.com/a/41903236/947
                centerBar: true,
                xAxisPadding: 1, // adds one day of padding on either side
                xAxisPaddingUnit: 'day'
            };
        })

        self.postSetup = (chart: BarChart) => {
            chart.yAxis().tickFormat(d3.format('.2s'));
            self.resetFilters = () => {
                chart.filterAll();
                dc.redrawAll();
            };
        };
    }],
    controllerAs: '$ctrl'
};

export default DcTimeBarChart;
