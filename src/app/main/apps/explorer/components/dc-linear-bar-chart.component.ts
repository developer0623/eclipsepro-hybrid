import * as _ from 'lodash';
import dc, { BarChart } from 'dc';
// import * as d3 from 'd3';

import LinearbarTemp from './dc-linear-bar-chart.component.html';

declare let d3: any

const DcLinearbarChart = {
    selector: 'dcLinearBarChart',
    bindings: {
        dimension: '<',
        group: '<',
        groupProperty: '@',
        valueProperty: '@',
        chartTitle: '@',
        height: '@'
    },
    // Load the template
    template: LinearbarTemp,
    controller: ['$element', function ($element) {
        let self = this;
        $element.ready(() => {
         console.log('221231231', self.dimension.top(1))
            self.options = {
                dimension: self.dimension,
                group: self.group,
                chartTitle: self.chartTitle,
                width: $element[0].clientWidth - 24,
                height: self.height,
                margins: {
                    top: 10,
                    right: 10,
                    bottom: 20,
                    left: 40
                },
                gap: 1,
                // x: d3.scale.linear().domain([0, 60]), //todo:scale based on data
                x: self.dimension.top(1).length > 0 ? d3.scale.linear().domain([0, self.dimension.top(1)[0][self.groupProperty]]) : d3.scale.linear().domain([0, 60]),
                //elasticX: true,
                elasticY: true,
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

export default DcLinearbarChart;
