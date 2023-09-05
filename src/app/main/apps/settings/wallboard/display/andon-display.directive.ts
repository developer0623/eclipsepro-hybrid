import Temp from './andon-display.html';

export function andonDisplayDirective() {
    return {
        restrict: 'E',
        template: Temp,
        scope: {
            sequence: '=',
            machine: '=',
            machineState: '=',
            shiftStats: '=',
            scheduleSummary: '=',
            statsHistory: '=',
            metricConfiguration: '=',
            metricDefinitions: '=',
            currTask: '=',
            currentJob: '=',
            currentItem: '=',
            viewKey: '=',
            playKey: '=',
            theme: '=',
            display: '@',
            coilType: '='
        }
    };
}
