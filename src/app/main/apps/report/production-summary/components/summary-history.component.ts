// import * as d3 from 'd3';
import Temp from './summary-history.component.html';
import { ProductionSummaryService } from '../../../../../core/services/productionSummary.service';

declare let d3: any

const SummaryHistory = {
  bindings: {
    data: '<',
    state: '<'
  },
  template: Temp,
  controller: ['$element', 'productionSummaryService', function ($element, productionSummaryService: ProductionSummaryService) {
    let self = this;


    self.getValueState = () => {
      // REFACTOR: This component should not rely on the existence of bullet data. The "ValueState"
      // should be passed in via a binding.
      if (self.data.bullet) {
        if (self.data.bullet.value < self.data.bullet.okRangeStart) {
          return 0;
        }

        if (self.data.bullet.value < self.data.bullet.okRangeEnd) {
          return 1;
        }
        return 2;
      }
      return 1;
    };

    self.getMarkerColor = () => {

      const state = self.getValueState();
      let bgCol = '';
      if (self.state) {
        bgCol = self.valueBgCol[2 - state];
      } else {
        bgCol = self.valueBgCol[state];
      }

      return bgCol;
    };


    self.drawGraph = () => {

      let chartEl = $element[0].childNodes[0];
      let margin = { top: 5, right: 5, bottom: 7, left: 5 };
      let width = chartEl.clientWidth - margin.left - margin.right;
      let height = chartEl.clientHeight - margin.top - margin.bottom;

      let hisLength = self.data.history.length;

      let x = d3.scale.linear().domain([0, hisLength - 1]).range([0, width]);
      let y = d3.scale.linear().range([height, 0]);
      y.domain([0, d3.max(self.data.history, function (d: any) { return d.value; })]);

      let valueline = d3.svg.line()
        .x(function (d, i) { return x(i); })
        .y(function (d: any) { return y(d.value); })
        .interpolate("basis");


      let svg = d3.select(chartEl)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const markerCol = self.getMarkerColor();

      let markgerId = `circle${productionSummaryService.markerId}`;
      productionSummaryService.markerId++;
      svg.append("svg:defs").append("svg:marker")
        .attr("id", markgerId)
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .attr("viewBox", "0 0 12 12")
        .append("circle")
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('r', 3)
        .attr('fill', markerCol);

      svg.append("path")        // Add the valueline path.
        .attr("class", "line")
        .attr("d", valueline(self.data.history))
        .attr("marker-end", `url(#${markgerId})`);
    };

    self.init = () => {


      if (self.data.history) {
        self.valueBgCol = ['#c1272d', '#4d4d4d', '#2f7852'];
        self.drawGraph();
      }
    };
    self.$onInit = () => {
      self.init();
    }

  }]
};

export default SummaryHistory;
