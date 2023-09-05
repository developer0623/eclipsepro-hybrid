import * as moment from "moment";

export function currentTimeDirective($interval, systemInfoService) {
    return {
        restrict: 'E',
        template: '<h4>{{time.now.hour}}:{{time.now.minute}}:{{time.now.second}} {{time.now.meridiem}}</h4>',
        link    : function (scope, element, attrs) {
            // Time widget
            scope.time = {
                now   : {
                    second: '',
                    minute: '',
                    hour  : '',
                    day   : '',
                    month : '',
                    year  : ''
                },
                ticker: function ()
                {
                    let now = moment().add(systemInfoService.serverTimeOffsetSeconds,'s');
                    let nowServer = now.clone(); 
                    //why not use moment formatting for this?
                    scope.time.now = {
                        meridiem: nowServer.format('a'),
                        second  : nowServer.format('ss'),
                        minute  : nowServer.format('mm'),
                        hour    : nowServer.format('hh')
                    };
                }
            };

            // Now widget ticker
            scope.time.ticker();

            let timeTicker = $interval(scope.time.ticker, 1000);

            scope.$on('$destroy', function ()
            {
                $interval.cancel(timeTicker);
            });
        }
    };
}
