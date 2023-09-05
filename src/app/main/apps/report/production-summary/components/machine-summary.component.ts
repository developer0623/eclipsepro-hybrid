import angular from 'angular';
// import * as d3 from 'd3';
import MachineSummaryTemplate from './machine-summary.component.html';
import PopOverTemplate from './popover.html';

declare let d3: any

const MachineSummary = {
  selector: 'machineSummary',
  bindings: {
    machine: '<',
    data: '<'
  },
  template: MachineSummaryTemplate,
  controller: ['$element', '$mdPanel', function ($element, $mdPanel) {
    let self = this;
    self._mdPanel = $mdPanel;
    self.panelRef = null;

    self.showPopover = (ev, data, state) => {
      if(self.panelRef) {
        self.panelRef.close();
      }
      let position = this._mdPanel.newPanelPosition()
          .relativeTo(ev.currentTarget)
          .addPanelPosition(this._mdPanel.xPosition.ALIGN_START, this._mdPanel.yPosition.BELOW);

      let config = {
        attachTo: angular.element(document.body),
        controller: ['$timeout', PerformancePanelCtrl],
        controllerAs: 'ctrl',
        template: PopOverTemplate,
        panelClass: 'demo-menu-example',
        position: position,
        locals: {
          'data': data,
          'state': state,
          'machine': self.machine
        },
        hasBackdrop: false,
        openFrom: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        // focusOnOpen: false

      };

      self._mdPanel.open(config).then(ref => {
        self.panelRef = ref;
      });


    }

      function PerformancePanelCtrl($timeout) {
        let ctrl = this;
        if(ctrl.state === 0) {
          ctrl.primary = ctrl.data.primary;
          ctrl.unit = 'FT';
        } else if (ctrl.state === 1){
          ctrl.primary = ctrl.data.primary;
          ctrl.unit = '%';
        } else {
          ctrl.primary = (ctrl.data.primary * 100).toFixed(1);
          ctrl.unit = '%';
        }

        this.valueBgCol = ['#c1272d', '#4d4d4d', '#2f7852'];

        this.getValueState = () => {
          if(ctrl.data.bullet.value < ctrl.data.bullet.okRangeStart) {
            return 0;
          }

          if(ctrl.data.bullet.value < ctrl.data.bullet.okRangeEnd) {
            return 1;
          }

          return 2;
        }
        this.getMarkerColor = () => {

          const state = ctrl.getValueState();
          let bgCol = '';
          // if(ctrl.state) {
          //   bgCol = self.valueBgCol[2 - state];
          // } else {
            bgCol = ctrl.valueBgCol[state];
          // }

          return bgCol;
        }
        this.init = function() {
          let margin = {top: 30, right: 20, bottom: 30, left: 50},
              width = 500 - margin.left - margin.right,
              height = 220 - margin.top - margin.bottom;
          let hisLength = ctrl.data.history.length;

          let x = d3.scale.linear().domain([0, hisLength - 1]).range([0, width]);
          let y = d3.scale.linear().range([height, 0]);
          y.domain([0, d3.max(ctrl.data.history, function(d: any) { return d.value; })]);

          let valueline = d3.svg.line()
              .x(function(d, i) { return x(i); })
              .y(function(d: any) { return y(d.value); })
              .interpolate("basis");


          let svg = d3.select("#report-popover__d3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          const markerCol = ctrl.getMarkerColor();

          svg.append("svg:defs").append("svg:marker")
            .attr("id", 'markgerId')
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
            .attr("d", valueline(ctrl.data.history))
            .attr("marker-end",`url(#markgerId`);



      }

      $timeout(function() {
        ctrl.init();
      });


      }

    }]
}

export default MachineSummary;
