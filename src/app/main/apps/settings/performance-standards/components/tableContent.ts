import angular from 'angular';
import * as _ from 'lodash';
// import * as d3 from 'd3';
import HeaderTemp from './templates/tableHeader.html';
import TableRowTemp from './templates/tableRow.html';
import TableCellTemp from './templates/tableCell.html';
import TableDefaultCellTemp from './templates/tableDefaultCell.html';
import PerformanceChartTemp from './templates/performance-chart.html';
import PerformanceItemTemp from './templates/performance-item.html';
import TableDialogHtml from './templates/tableDialog.html';
import { PerformanceDataService } from '../../../../../core/services/performanceData.service';
import { initialize } from 'perfect-scrollbar';

declare let d3: any

export default angular
    .module('app.performance-standards.components', [])
    .component("tableHeader", {
        bindings: {
            status: '<'
        },
        template: HeaderTemp,
        controller: TableHeaderController

    })
    .component("tableRow", {
        bindings: {
            item: '=',
            origin: '=',
            istool: '<',
            index: '<',
            machinenum: '<',
            parentval: '=',
            onFocus: '&',
        },
        template: TableRowTemp,
        controller: TableRowController

    })
    .component("tableCell", {
        bindings: {
            prefix: '<',
            suffix: '<',
            origin: '=',
            istool: '<',
            index: '<',
            state: '=',
            value: '<',
            unit: '<',
            onFocus: '&',
        },
        template: TableCellTemp,
        controller: TableCellController

    })
    .component("tableDefaultCell", {
        bindings: {
            prefix: '<',
            suffix: '<',
            origin: '=',
            istool: '<',
            index: '<',
            state: '=',
            value: '<',
            unit: '<',
            onFocus: '&',
        },
        template: TableDefaultCellTemp,
        controller: TableDefaultCellController
    })
    .component("performanceChart", {
        bindings: {
            value: '='
        },
        template: PerformanceChartTemp,
        controller: PerformanceChartController

    })
    .component("performanceItem", {
        bindings: {
            item: '=',
            islength: '=',
            onRemove: '&',
            onChanged: '&'
        },
        template: PerformanceItemTemp,
        controller: PerformanceItemController

    })
    .name;

    TableHeaderController.$inject = ['unitsService']
function TableHeaderController(unitsService) {
    let ctrl = this;
    this.headers = [{ title: unitsService.getUserUnitDef('fpm').title, lowTitle: unitsService.getUserUnitDef('fpm').key.toUpperCase() },
    { title: "Tooling Change", lowTitle: "Minutes" },
    { title: "Coil Change", lowTitle: "Minutes" },
    { title: "Bundle Change", lowTitle: "Minutes" }
    ];

}

PerformanceItemController.$inject = ['$timeout']
function PerformanceItemController($timeout: ng.ITimeoutService) {
    let ctrl = this;
    ctrl.focus = () => {
        ctrl.setFocus(true);
    }
    ctrl.blur = () => {
        ctrl.setFocus(false);
        $timeout(() => {
            ctrl.onChanged();
        }, 150);
    }

    ctrl.setFocus = (state) => {
        $timeout(() => {
            ctrl.isFocus = state;
        }, 200);
    }

    ctrl.onRemoveItem = () => {
        ctrl.onRemove();
    }
}

TableCellController.$inject = ['$mdDialog', '$timeout', 'performanceData', 'unitsService', '$scope']
function TableCellController($mdDialog, $timeout: ng.ITimeoutService, performanceData: PerformanceDataService, unitsService, $scope) {
    let ctrl = this;
    // ctrl.value = ctrl.value ? ctrl.value : [];
    // let previousValue = [];
    // ctrl.isArrayEqual = (arr1, arr2) => {
    //     return _.differenceWith(arr1, arr2, _.isEqual).length;
    // }


    // ctrl.$doCheck = function () {
    //     let currentValue = ctrl.value;
    //     let lengthOfDifferences = ctrl.isArrayEqual(currentValue, previousValue);
    //     if (lengthOfDifferences) {
    //         console.log('changed');
    //         previousValue = currentValue;
    //     }
    // };

    ctrl.openDialog = (ev) => {
        $mdDialog.show({
            controller: DialogController,
            controllerAs: 'ctrl',
            template: TableDialogHtml,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                'prefix': ctrl.prefix,
                'suffix': ctrl.suffix,
                'origin': ctrl.origin,
                'istool': ctrl.istool,
                'index': ctrl.index
            },
            onRemoving: (event, removePromise) => {
                ctrl.updateSummary();
            }
        });
    }

    ctrl.onEdit = (ev) => {

    }

    ctrl.getValue = () => {
        (ctrl.value || []).forEach(f => f.fpm = unitsService.getUserFromSystem(f.fpm, ctrl.unit));
        this.updateSummary();
    }

    ctrl.updateSummary = () => {
        const v: { fpm }[] = (ctrl.value || []);
        ctrl.minValue = _.minBy(v, 'fpm').fpm;
        ctrl.maxValue = _.maxBy(v, 'fpm').fpm;
        if (ctrl.value.length > 1) {
            ctrl.isEdit = false;
        } else {
            ctrl.isEdit = true;
        }
    }

    ctrl.apiCall = () => {
        let data = {
            machineNumber: ctrl.origin.machineNumber,
            toolingId: null,
            field: `${ctrl.prefix}${ctrl.suffix}`,
            value: ctrl.value.map(x => ({ ...x, fpm: unitsService.getSystemFromUser(x.fpm, 'ft') }))
        };
        if (ctrl.istool) {
            data.toolingId = ctrl.origin.toolings[ctrl.index].toolingId
        }
        performanceData.updateValue(data);
    }

    ctrl.focus = (state) => {
        if (state) {
            ctrl.oldValue = ctrl.value[0].fpm;
        } else if (ctrl.oldValue !== ctrl.value[0].fpm) {
            ctrl.apiCall();
        }
        $timeout(() => {
            ctrl.isFocus = state;
            // this.onFocus({ state: state });
        }, 200);
    }

    ctrl.$onInit = () => {
        if (ctrl.value.length) {
            ctrl.getValue();
        }
    }
}

TableDefaultCellController.$inject = ['$timeout', 'performanceData', 'unitsService']
function TableDefaultCellController($timeout: ng.ITimeoutService, performanceData: PerformanceDataService, unitsService) {
    let ctrl = this;

    ctrl.init = () => {
        ctrl.value = unitsService.getUserFromSystem(ctrl.value, ctrl.unit);
    }

    ctrl.apiCall = () => {
        let data = {
            machineNumber: ctrl.origin.machineNumber,
            toolingId: null,
            field: `${ctrl.prefix}${ctrl.suffix}`,
            value: unitsService.getSystemFromUser(ctrl.value, ctrl.unit)
        };
        if (ctrl.istool) {
            data.toolingId = ctrl.origin.toolings[ctrl.index].toolingId
        }
        performanceData.updateValue(data);
    }

    ctrl.focus = (state) => {
        if (state) {
            ctrl.oldValue = ctrl.value;
        } else if (ctrl.oldValue !== ctrl.value) {
            ctrl.apiCall();
        }
        $timeout(() => {
            ctrl.isFocus = state;
            // ctrl.onFocus({ state: state });
        }, 100);
    }

    ctrl.init();
}

DialogController.$inject = ['$mdDialog', '$timeout', 'performanceData', 'prefix', 'suffix', 'origin', 'istool', 'index', 'unitsService']
function DialogController($mdDialog, $timeout: ng.ITimeoutService, performanceData: PerformanceDataService, prefix, suffix, origin, istool, index, unitsService) {
    let ctrl = this;

    ctrl.setStyle = () => {
        if (ctrl.value.length > 1) {
            ctrl.selectedStyle = 1;
            ctrl.isShowSingle = false;
        } else {
            ctrl.selectedStyle = 0;
            ctrl.isShowSingle = true;
        }
    }

    ctrl.getValue = () => {
        if (ctrl.istool) {
            ctrl.value = ctrl.origin.toolings[ctrl.index][`${ctrl.prefix}${ctrl.suffix}`];
        } else {
            ctrl.value = ctrl.origin.default[`${ctrl.prefix}${ctrl.suffix}`];
        }
    }

    ctrl.init = function () {
        ctrl.prefix = prefix;
        ctrl.suffix = suffix;
        ctrl.origin = origin;
        ctrl.istool = istool;
        if (ctrl.istool) {
            ctrl.index = index;
        } else {
            ctrl.index = 0;
        }

        ctrl.machinenum = ctrl.origin.machinenum;

        ctrl.category = [{ title: 'Planning', value: 'Plan' }, { title: 'Target', value: 'Target' }];
        if (ctrl.suffix === 'Plan') {
            ctrl.selectedCategory = ctrl.category[0];
        } else {
            ctrl.selectedCategory = ctrl.category[1];
        }
        ctrl.styles = [{ id: 0, value: "SINGLE VALUE" }, { id: 1, value: "LENGTH BASED" }];
    }
    ctrl.apiCall = () => {
        let data = {
            machineNumber: ctrl.origin.machineNumber,
            toolingId: null,
            field: `${ctrl.prefix}${ctrl.suffix}`,
            value: ctrl.value.map(v => ({ ...v, fpm: unitsService.getSystemFromUser(v.fpm, 'ft') }))
        };
        if (ctrl.istool) {
            data.toolingId = ctrl.origin.toolings[ctrl.index].toolingId
        }
        performanceData.updateValue(data);
    }

    ctrl.addValue = () => {
        let item = { lengthIn: 0, fpm: 0 };
        ctrl.value.push(item);
        if (ctrl.value.length > 1) {
            ctrl.isShowSingle = false;
        }
        ctrl.apiCall();
    }
    ctrl.changeStyle = () => {

    }

    ctrl.reDrawChart = () => {
        ctrl.isChart = true;
        $timeout(() => {
            ctrl.isChart = false;
        }, 50);
    }

    ctrl.onClickCategoryItem = (ev, item) => {
        ctrl.suffix = item.value;
        ctrl.selectedCategory = item;
        ctrl.getValue();
        ctrl.setStyle();
        ctrl.reDrawChart();
    }

    ctrl.onRemoveItem = (index) => {
        ctrl.value.splice(index, 1);
    }

    ctrl.onValueChanged = () => {
        ctrl.value = _.orderBy(ctrl.value, ['lengthIn']);
        ctrl.reDrawChart();
        ctrl.apiCall();
    }

    ctrl.onTabSelected = (istool) => {
        ctrl.getValue();
        ctrl.setStyle();
    }

    ctrl.onClickToolItem = (ev, item, index) => {
        ctrl.index = index;
        ctrl.getValue();
        ctrl.setStyle();
        ctrl.reDrawChart();
    }

    ctrl.init();

}

PerformanceChartController.$inject = ['$element', '$timeout']
function PerformanceChartController($element, $timeout: ng.ITimeoutService) {
    let ctrl = this;

    ctrl.init = () => {
        let chartEl = $element[0].childNodes[0];
        let margin = { top: 20, right: 40, bottom: 20, left: 70 };
        let width = chartEl.clientWidth - margin.left - margin.right;
        let height = chartEl.clientHeight - margin.top - margin.bottom;
        let x = d3.scale.linear().range([0, width]);
        let y = d3.scale.linear().range([height, 0]);
        let tickCount = ctrl.value.length;
        let xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(tickCount);
        let yAxis = d3.svg.axis().scale(y).orient("left").ticks(tickCount);

        let lastItem = ctrl.value[ctrl.value.length - 1];

        let newItem = { lengthIn: lastItem.lengthIn + 10, fpm: lastItem.fpm };
        let graphData = ctrl.value.concat(newItem);

        let valueline = d3.svg.line()
            .x(function (d: any) { return x(d.lengthIn); })
            .y(function (d: any) { return y(d.fpm); });

        let svg = d3.select("#performance-tooltip__d3")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "arrow")
            .attr("refX", 6)
            .attr("refY", 6)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 12)
            .attr("markerHeight", 12)
            .attr("orient", "auto")
            .attr("viewBox", "0 0 12 12")
            .append("path")
            .attr("d", "M2,1 L7,6 L2,11")
            .style("strokeWidth", 2);

        // x.domain(d3.extent(graphData, function(d: any) { return d.lengthIn; }));
        // y.domain([0, d3.max(graphData, function(d: any) { return d.fpm; }) + 20]);
        x.domain([0, newItem.lengthIn]);
        y.domain([0, d3.max(graphData, function (d: any) { return d.fpm; })]);
        // y.domain([0, newItem.fpm]);

        svg.append("path")        // Add the valueline path.
            .attr("class", "line")
            .attr("d", valueline(graphData))
            .attr("marker-end", "url(#arrow)");

        svg.selectAll(".dot")
            .data(ctrl.value)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d: any) { return x(d.lengthIn) })
            .attr("cy", function (d: any) { return y(d.fpm) })
            .attr("r", 3);
        svg.append("g")            // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")            // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis);

    }
    $timeout(function () {
        if (ctrl.value.length) {
            ctrl.init();
        }
    });

}


TableRowController.$inject = ['performanceData']

function TableRowController(performanceData: PerformanceDataService) {
    let ctrl = this;

    ctrl.$onChanges = function (changes) {
    };

    this.onExpand = function () {
        performanceData.changeStatus(ctrl.index);
    }

    this.getChecked = function () {
        return performanceData.getStatus(ctrl.index);
    }

    ctrl.onFocus = (ev) => {
        ctrl.isEdit = ev;
    }

    ctrl.saveOverride = () => {
        let data = {
            machineNumber: ctrl.origin.machineNumber,
            toolingId: ctrl.origin.toolings[ctrl.index].toolingId,
            field: `overrideMachine`,
            value: ctrl.item.overrideMachine
        };
        performanceData.updateValue(data);
    }

    // this.destroyFocus = function(form) {

    //     let editedValue = form.$editables[0].scope.$data;
    //     this.focused = false;
    //     if(this.previousValue !== editedValue) {
    //         this.selectedElement.className += " edited";
    //     }
    //     if(ctrl.index !== null) {
    //         ctrl.onFocus({index: null});
    //     }
    // }

    // this.focusSelect = function(form) {
    //     let input = form.$editables[0].inputEl;
    //     this.previousValue = form.$editables[0].scope.$data;
    //     setTimeout(function() {
    //         input.select();
    //     }, 0);

    //     this.selectedElement = form.$editables[0].elem[0];

    //     this.focused = true;
    //     if(ctrl.index !== null) {
    //         ctrl.onFocus({index: ctrl.index});
    //     }

    // }

    this.compareParent = function (fieldKey: string) {
        // let keyFlag = false;


        if (ctrl.parentval && ctrl.item[fieldKey] !== ctrl.parentval[fieldKey]) {
            return true;
        }
        return false;
    }

    this.destroyFocus = function (element) {

        let editedValue = element.target.value;
        this.focused = false;
        // if(this.previousValue !== editedValue) {
        //     this.selectedElement.className += " edited";
        // }
        if (ctrl.index !== null) {
            ctrl.onFocus({ index: null });
        }
    }

    this.focusSelect = function (element) {
        console.log("element", element);
        // console.log("value", element.target.value);
        let input = element.target;
        this.previousValue = element.target.value;
        setTimeout(function () {
            input.select();
        }, 0);

        this.selectedElement = input;

        this.focused = true;
        if (ctrl.index !== null) {
            ctrl.onFocus({ index: ctrl.index });
        }
    }

    this.compareHistorical = function (mainValue, hisValue) {
        let myStyle;
        if (mainValue >= hisValue) {
            myStyle = { 'background-color': 'transparent' };
        } else if (mainValue < hisValue / 2) {
            myStyle = { 'background-color': 'red' };
        } else {
            myStyle = { 'background-color': 'yellow' };
        }
        return myStyle;
    }

    this.getCount = function () {
        let count = performanceData.getCount(ctrl.index);
        let value = '';
        return value + count.unChecked + '/' + count.total;
    }
}
