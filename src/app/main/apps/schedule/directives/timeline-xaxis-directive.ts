// import * as d3 from 'd3';

declare let d3: any
export function timelineXAxis() {

    return {
      restrict: 'E',
      replace: true,
      scope: {
        displayXDomain: '=', // A two element array: [min time, max time],,the time format is hh:mm:ss.mmm,If not specified, the default domain is the extent of the entire set of data.
        height: '@', // The height of the chart area, the default is 100px
        width: '@', // The width of the chart area, the default is width of the container.
        cursorTime: '=',
      },

      link: function ($scope, $element, $attrs) {
        // **************************************
        // Setup key variables
        // **************************************
        let height = $scope.height || 100;
        let width = $scope.width || $element.parent()[0].clientWidth;
        let drawFlag = false;
        //width and height of actual chart
        let paddingTop = 0;
        let paddingRight = 0;
        let paddingBottom = 40;
        let paddingLeft = 0;
        let scaleWidth = width - paddingLeft - paddingRight;
        let scaleHeight = height - paddingTop - paddingBottom;

        // Determine the data time and value domains.  Use the extents if provided otherwise generate from the data
        let xValDomain = $scope.displayXDomain;

        // Create the x and y scales (interpolation tables between data values and SVG x & y coordinates)
        let xScale = d3.time.scale().range([0, scaleWidth]).domain(xValDomain);

        // Setup x axis
        let customTimeFormat = d3.time.format.multi([
          [
            '.%L',
            function (d) {
              return d.getMilliseconds();
            },
          ],
          [
            ':%S',
            function (d) {
              return d.getSeconds();
            },
          ],
          [
            '%I:%M',
            function (d) {
              return d.getMinutes();
            },
          ],
          [
            '%I %p',
            function (d) {
              return d.getHours();
            },
          ],
          [
            '%a %d',
            function (d) {
              return d.getDay() && d.getDate() !== 1;
            },
          ],
          [
            '%b %d',
            function (d) {
              return d.getDate() !== 1;
            },
          ],
          [
            '%B',
            function (d) {
              return d.getMonth();
            },
          ],
          [
            '%Y',
            function () {
              return true;
            },
          ],
        ]);
        let xAxis = d3.svg
          .axis()
          .scale(xScale)
          .orient('bottom')
          .tickFormat(customTimeFormat);

        // **************************************
        // Setup SVG chart basic structure
        // Z-order note: last defined = top
        // **************************************

        let svg = d3
          .select($element[0])
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('font-size', '10');
        svg
          .append('defs')
          .append('clipPath')
          .attr('id', 'clip')
          .append('rect')
          .attr('width', scaleWidth)
          .attr('height', '100%');

          let gChart = svg
          .append('g')
          .attr(
            'transform',
            'translate(' + paddingLeft + ',' + paddingTop + ')'
          )
          .attr('width', scaleWidth)
          .attr('height', scaleHeight)
          .attr('clip', 'url(#clip)');

        let gxAxis = gChart
          .append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + scaleHeight + ')');

        let gMain = gChart
          .append('g')
          .attr('class', 'main')
          .attr('height', scaleHeight);

        // **************************************
        // Setup cursor
        // **************************************
        let gCursor = gMain
          .append('g')
          .attr('class', 'cursor')
          .append('line')
          .attr('y1', 0.0)
          .attr('y2', height);
        function drawCursor() {
          let x = xScale($scope.cursorTime);

          gCursor.attr('x1', x);
          gCursor.attr('x2', x);
        }
        drawCursor();

        let advanceCursorTime = function () {
          $scope.cursorTime = Date.now();
          $scope.$apply();
        };
        setInterval(advanceCursorTime, 1000); // TODO: Instead of every second, make the interval depend on the current zoom level.

        // **************************************
        // Setup watch functions
        // **************************************

        // Todo: change this to be an event handler
        $scope.$watch(
          'cursorTime',
          function (newVal, oldVal) {
            draw();
          },
          true
        );

        $scope.$on('timeLine.xDomain', function (event, data) {
          xValDomain = data;
          xScale.domain(xValDomain);
          draw();
        });

        // **************************************
        // Function definitions
        // **************************************

        //redraw chart content
        function draw() {
          drawCursor();
          xAxis.scale(xScale);
          gxAxis.call(xAxis);

          if (drawFlag) {
            // x axis
            //x axis tick  has four format,the rule as below:
            //1. if domain width of tick span less than 1000ms, then tick format is hh:mm:ss.mmm, the tick span width is 80px;
            //2. if domain width of tick span less than 60 second, then tick format is hh:mm:ss.m, the tick span width is 70px;
            //3. if domain width of tick span less than 1 hour, then tick format is hh:mm:ss, the tick span width is 60px;
            //4. if domain width of tick span greater than 1 hour, then tick format is hh:mm, the tick span width is 50px;

            let tickRoundMs = 0;
            let tickSpanMs = 80,
              tickSpan100Ms = 70,
              tickSpanS = 60,
              tickSpanMin = 50;
            let tickStep = 0;
            let xDomainWidth = xValDomain[1] - xValDomain[0];

            if (xDomainWidth / (scaleWidth / tickSpanMs) <= 1000) {
              //format is hh:mm:ss.mmm
              tickStep = xDomainWidth / (scaleWidth / tickSpanMs);
              tickRoundMs = 1;
            } else if (
              xDomainWidth / (scaleWidth / tickSpan100Ms) <=
              1 * 60 * 1000
            ) {
              //format is hh:mm:ss.m
              tickStep = xDomainWidth / (scaleWidth / tickSpan100Ms);
              tickRoundMs = 100;
            } else if (
              xDomainWidth / (scaleWidth / tickSpanS) <=
              1 * 3600 * 1000
            ) {
              //format is hh:mm:ss
              tickStep = xDomainWidth / (scaleWidth / tickSpanS);
              tickRoundMs = 1000;
            } else {
              //format is hh:mm
              tickStep = xDomainWidth / (scaleWidth / tickSpanMin);
              tickRoundMs = 1000 * 60;
            }

            //offset tickStep/2 tick width, avoid first or last tick label outside of chart
            let ticks = d3
              .range(
                xValDomain[0].getTime() + tickStep / 2,
                xValDomain[1].getTime() - tickStep / 2,
                tickStep
              )
              .map(function (d) {
                d = Math.round(d / tickRoundMs) * tickRoundMs;
                return new Date(d);
              });

            let zxAxis = d3.svg
              .axis()
              .scale(xScale)
              .orient('bottom')
              .tickValues(ticks)
              .tickFormat(function (d) {
                let s = '';
                switch (tickRoundMs) {
                  case 1:
                    s = d3.time.format('%H:%M:%S.%L')(d);
                    break;
                  case 100:
                    s = d3.time.format('%H:%M:%S.%L')(d);
                    s = s.substring(0, s.length - 2);
                    break;
                  case 1000:
                    s = d3.time.format('%H:%M:%S')(d);
                    break;
                  default:
                    s = d3.time.format('%H:%M')(d);
                }
                return s;
              });
            //gxAxis.call(xAxis);
          }
        }
      },
    };
}
