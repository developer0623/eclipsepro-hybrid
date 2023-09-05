// import * as d3 from 'd3';

declare let d3: any

timelineBlock.$inject = ['$rootScope', '$state', 'unitsService']
export function timelineBlock($rootScope, $state, unitsService) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      name: '@', // For debug purposes
      machineNumber: '@',
      displayXDomain: '=', // A two element array: [min time, max time],
      // the time format is hh:mm:ss.mmm,If not specified, the default domain is the extent of the entire set of data.
      height: '@', //The height of the chart area, the default is 100px
      width: '@', //The width of the chart area,the default is width of the container.
      radius: '@', // Radius of each event circle
      data: '=', //An array of timeblock objects {dateTime, value}
      searchText: '=', // Used to highlight timeblocks with matching text
      showXAxis: '=', //Boolean value,whether to show x axis, default is false.
      brushOutput: '=', //This is the current value of the brush’s extent. It should use 2-way binding. If specified, a brush should be enabled for this chart.
      cursorTime: '=',
    },

    link: function ($scope, $element, $attrs) {
      // **************************************
      // Setup key variables
      // **************************************
      let height = $scope.height || 100;
      let width = $scope.width || $element.parent()[0].clientWidth;

      //width and height of actual chart
      let paddingTop = 0;
      let paddingRight = 0;
      let paddingBottom = $scope.showXAxis ? 40 : 0;
      let paddingLeft = $scope.showYAxis ? 40 : 0;
      let scaleWidth = width - paddingLeft - paddingRight;
      let scaleHeight = height - paddingTop - paddingBottom;

      // Determine the data time and value domains.  Use the extents if provided otherwise generate from the data
      let xValDomain = $scope.displayXDomain || [
        d3.min($scope.data, function (d: any) {
          return new Date(d.startDateTime);
        }),
        d3.max($scope.data, function (d: any) {
          return new Date(d.endDateTime);
        }),
      ];

      let zoom;

      // The Y domain and axis display might be useful if the blocks had a value (i.e. FPM)
      //let yValDomain = $scope.displayYDomain || d3.extent($scope.data, function (d) { return d.value; });

      // Create the x and y scales (interpolation tables between data values and SVG x & y coordinates)
      let xScale: any = d3.time
        .scale()
        .range([0, scaleWidth])
        .domain(xValDomain);
      //let yScale = d3.scale.linear().range([scaleHeight, 0]).domain(yValDomain);

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
      let defs = svg.append('defs');
      defs
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', scaleWidth)
        .attr('height', '100%');
      let coilWarnPattern = defs.append('pattern').attr({
        id: 'pattern-coilwarn',
        width: '10',
        height: '10',
        patternTransform: 'rotate(60 0 0)',
        patternUnits: 'userSpaceOnUse',
      });
      coilWarnPattern.append('rect').attr({
        x: '0',
        y: '0',
        width: '10',
        height: '10',
        style: 'fill:#F2D20C',
      });
      coilWarnPattern.append('line').attr({
        x1: '0',
        y1: '0',
        x2: '0',
        y2: '10',
        style: 'stroke:#D32F2F; stroke-width:10',
      });

      let gChart = svg
        .append('g')
        .attr(
          'transform',
          'translate(' + paddingLeft + ',' + paddingTop + ')'
        )
        .attr('width', scaleWidth)
        .attr('height', scaleHeight)
        .attr('clip', 'url(#clip)');

      gChart
        .append('rect')
        .attr('class', 'chartbody')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('y', '1');

      let gMain = gChart
        .append('g')
        .attr('class', 'timeBlock')
        .attr('height', scaleHeight);

      let gBrush = gMain.append('g').attr('class', 'brush');

      // **************************************
      // Setup Tooltip
      // **************************************
      let tooltip: any = d3
        .select('body')
        .append('div')
        .attr('class', 'eventToolTip')
        .attr('position', 'absolute')
        .style('opacity', 0);

      // **************************************
      // Setup brush or zoom/pan behavior
      // **************************************
      let inZoom = false;

      if ($scope.brushOutput) {
        let brush = d3.svg
          .brush()
          .x(xScale)
          .extent($scope.brushOutput)
          .on('brushend', function () {
            if (!brush.empty()) {
              $scope.brushOutput = brush.extent();
              $scope.$apply();
            }
          });
        gBrush.attr('fill-opacity', 0.125).call(brush);
        gBrush.selectAll('rect').attr('height', '100%');
      } else {
        // Setup zoom and pan behavior (since we're not a brush/range display)
        zoom = d3.behavior
          .zoom()
          .x(xScale)
          .on('zoom', zoomHandler)
          .on('zoomstart', zoomStart)
          .on('zoomend', zoomEnd);
        svg.call(zoom).on('dblclick.zoom', null);
      }

      function zoomStart() {
        console.log('zoomstart', tooltip);
        tooltip.transition().style('opacity', 0);
        inZoom = true;
      }
      function zoomEnd() {
        console.log('zoomend');
        tooltip.transition().duration(2000).style('opacity', 1);
        inZoom = false;
      }

      function zoomHandler() {
        xValDomain = xScale.domain();
        $scope.displayXDomain = xScale.domain();
        //let rangeDiff = xValDomain[1].getTime() - xValDomain[0].getTime();
        //let zoomRange = (rangeDiff / (1000 * 60));
        //if(zoomRange >= 10 && zoomRange <= 525600){
        $scope.$apply();
        $rootScope.$broadcast('timeLine.xDomain', $scope.displayXDomain);
        draw();
        //}
      }

      // **************************************
      // Setup cursor
      // **************************************
      let gCursor = gChart
        .append('g')
        .attr('class', 'cursor')
        .append('line')
        .attr('y1', 0.0)
        .attr('y2', '100%');
      function drawCursor() {
        let x = xScale($scope.cursorTime);
        gCursor.attr('x1', x);
        gCursor.attr('x2', x);
      }
      drawCursor();

      // **************************************
      // Setup watch functions
      // **************************************
      //this is temporary. Find a better way.
      $scope.$on('updatedScheduleEstimate', function (event, machineNumber) {
        if (machineNumber === +$scope.machineNumber) {
          //Not yet sure if `draw()` is enough. Needs a bit more testing...

          //wait for digest to complete so that we have our data
          $scope.$$postDigest(function () {
            draw();
          });
        }
      });
      $scope.$watch(
        'cursorTime',
        function (newVal, oldVal) {
          drawCursor();
        },
        true
      );

      // The watch was very chatty and made the performance sucky. The real solution is to find out why angular is notifying that the data is changing when it is not.
      // Using differenceWith could be the better way but we have an incompatibility with v4 of lodash
      //  $scope.$watch('data', function (newVal, oldVal) {
      //    if( _.differenceWith(oldVal, newVal, _.isEqual).isEmpty()) { //this only works in lodash v4
      //      console.log('Different Watching machine ' + $scope.name);
      //      draw();
      //    }
      //  }, true);

      $scope.$watch(
        'searchText',
        function (newVal, oldVal) {
          if (newVal) {
            draw();
          } else {
            draw();
          }
        },
        true
      );

      $scope.$on('timeLine.xDomain', function (event, data) {
        if (!inZoom) {
          xValDomain = data;
          xScale.domain(xValDomain);
          zoom.x(xScale);
          draw();
        }
      });

      $scope.$on('$destroy', () => {
         tooltip
            .transition()
            .style('z-index', 0)
            .duration(500)
            .style('display', 'none');
      });

      // **************************************
      // Function definitions
      // **************************************
      const tooltipMap = (d) => {
        //let formatTimeText = function() {
        //return /*moment.duration(d.duration).humanize() +*/ ' (' + new Date(d.startDateTime).toLocaleTimeString() + ' - ' +
        //new Date(d.endDateTime).toLocaleTimeString();
        //};
        let startDate = new Date(d.startDateTime);
        let endDate = new Date(d.endDateTime);
        let startHours = startDate.getHours();
        let startMinutes: any = startDate.getMinutes();
        let startampm = startHours >= 12 ? 'PM' : 'AM';
        startHours = startHours % 12;
        startHours = startHours ? startHours : 12; // the hour '0' should be '12'
        startMinutes = startMinutes < 10 ? '0' + startMinutes : startMinutes;
        let startTime = `<span style="font-weight:600;font-size:15px">${startHours}:${startMinutes}</span>
          <span style="font-size:11px;font-weight:600;">${startampm}</span>`;

        let endHours = endDate.getHours();
        let endMinutes: any = endDate.getMinutes();
        let endampm = endHours >= 12 ? 'PM' : 'AM';
        endHours = endHours % 12;
        endHours = endHours ? endHours : 12; // the hour '0' should be '12'
        endMinutes = endMinutes < 10 ? '0' + endMinutes : endMinutes;
        let endTime =
          '<span style="font-weight:600;font-size:15px">' +
          endHours +
          ':' +
          endMinutes +
          '</span> ' +
          '<span style="font-size:11px;font-weight:600;">' +
          endampm +
          '</span>';

        let formatStartDate =
          startDate.getMonth() +
          1 +
          '/' +
          startDate.getDate() +
          '/' +
          startDate.getFullYear().toString().substr(2, 2);
        let formatendDate =
          endDate.getMonth() +
          1 +
          '/' +
          endDate.getDate() +
          '/' +
          endDate.getFullYear().toString().substr(2, 2);

        let durationMs =
          d.activityType === 'Production'
            ? d.remainingRuntimeMs
            : d.durationMs;
        let durationMins = Math.floor(durationMs / (1000 * 60)) % 60;
        let durationHours = Math.floor(durationMs / (1000 * 60 * 60)) % 24;
        let durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

        let daysText =
          durationDays !== 0
            ? '<span class="duration">' +
            durationDays +
            '</span><span class="durationTime">d</span>'
            : '';

        let hoursText =
          durationHours !== 0
            ? '<span class="duration">' +
            durationHours +
            '</span><span class="durationTime">h</span>'
            : '';

        let timeBlock = `<div class="brdr-top"><table><tr>
            <td><div class="mrgnRght">${formatStartDate}</div><div class="grnBrdr">${startTime}</div></td>
            <td><div class="mrgnRght">&nbsp;</div>
              <span class="greenClr">
                ${daysText} ${hoursText}
                <span class="duration">${durationMins}</span>
                <span class="durationTime">m</span>
              </span></td>
            <td>
              <div class="mrgnRght">${formatendDate}</div>
              <div class="grnBrdr">${endTime}</div>
            </td></tr></table></div>`;

        let activityTitle;
        if (d.activityType === 'ToolAndMaterialChange') {
          activityTitle = 'Tool And Material Change';
        } else if (d.activityType === 'ToolChange') {
          activityTitle = 'Tool Change';
        } else if (d.activityType === 'MachineConfig') {
          activityTitle = 'Machine Config';
        } else if (d.activityType === 'MaterialChange') {
          activityTitle = 'Material Change';
        } else if (d.activityType === 'CoilChange') {
          activityTitle = 'Coil Change';
        } else if (d.activityType === 'Maintenance') {
          activityTitle = 'Maintenance';
        } else if (d.activityType === 'Breakdown') {
          activityTitle = 'Breakdown';
        } else if (d.activityType === 'Production') {
          activityTitle = 'Production';
        } else if (d.activityType === 'Unscheduled') {
          activityTitle = 'Unscheduled';
        } else if (d.activityType === 'Break') {
          activityTitle = 'Break';
        } else if (d.activityType === 'Meeting') {
          activityTitle = 'Meeting';
        } else {
          activityTitle = d.activityType + ' - ' + d.title;
        }

        if (d.activityType === 'Production') {
          let orderCode = d.orderCode;
          let customerName = d.customerName;
          let percentageComplete = Math.round(
            ((d.totalFt - d.remainingFt) / d.totalFt) * 100
          );
          return `<div class="scheduleTooltip" style="color:#8FAE17; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            <div style="font-weight:600;color:#000000">${orderCode}</div>
            <div>${customerName}</div>
            ${timeBlock}
            <div style="margin-top:10px">
            <table class="innerTable"><tr><th>TOTAL</th><th>REMAINING</th><th>PERCENTAGE</th></tr><tr>
              <td>${unitsService.formatUserUnits(d.totalFt, 'ft', 0)}</td>
              <td>${unitsService.formatUserUnits(d.remainingFt, 'ft', 0)}</td>
              <td>${percentageComplete}</td>
            </tr></table></div>`;
        } else if (
          d.activityType === 'ToolAndMaterialChange' ||
          d.activityType === 'MachineConfig' ||
          d.activityType === 'MaterialChange' ||
          d.activityType === 'ToolChange'
        ) {
          return `<div style="color:#F68B1F; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px">
            <table class="innerTable"><tr><th style="width:50%;">MATERIAL</th><th>TOOLING</th><th>TOTAL</th></tr><tr>
              <td>${d.materialCode}</td>
              <td>${d.toolingCode}</td>
              <td>${unitsService.formatUserUnits(d.totalFt, 'ft', 0)}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'Unscheduled') {
          return `<div style="color:#000000; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px">
            <table class="innerTable"><tr><th>TITLE</th></tr><tr>
              <td>${d.title}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'Break') {
          return `<div style="color:#0071B5; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px">
            <table class="innerTable"><tr><th>TITLE</th></tr><tr>
              <td>${d.title}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'Meeting') {
          return `<div style="color:#11897D; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px"><table class="innerTable"><tr><th style="width:0;">TITLE</th></tr><tr>
              <td>${d.title}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'CoilChange') {
          let coilId = (d.coilUsed && d.coilUsed.coilId) || '«none»';
          let coilFt =
            (d.coilUsed &&
              d.coilUsed.coilId &&
              Math.round(d.coilUsed.coilFt)) ||
            0;
          return `<div style="color:#F2D20C; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px"><table class="innerTable"><tr><th>MATERIAL</th><th>PREFERRED COIL</th><th>REMAINING</th></tr><tr>
              <td>${d.materialCode}</td>
              <td>${coilId}</td>
              <td>${unitsService.formatUserUnits(coilFt, 'ft', 0)}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'Maintenance') {
          return `<div style="color:#74592E; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px;"><table class="innerTable"><tr><th style="width:0;">TITLE</th></tr><tr>
              <td>${d.title}</td>
            </tr></table></div>`;
        } else if (d.activityType === 'Breakdown') {
          return `<div style="color:#942015; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}
            <div style="margin-top:10px;"><table class="innerTable"><tr><th style="width:0;">TITLE</th></tr><tr>
              <td>${d.title}</td>
            </tr></table></div>`;
        } else {
          return `<div style="color:#000000; text-transform:uppercase;font-size:11px;padding-bottom:3px;">${activityTitle}</div>
            ${timeBlock}`;
        }
      }

      function blockHeightMap(d) {
        if (d.activityType === 'Break' || d.activityType === 'Meeting') {
          return '43.3%';
        } else if (d.activityType === 'CoilChange') {
          return '30%';
        } else if (d.activityType === 'Unscheduled') {
          return '47%';
        } else if (
          d.activityType === 'Maintenance' ||
          d.activityType === 'ToolAndMaterialChange' ||
          d.activityType === 'Breakdown' ||
          d.activityType === 'MachineConfig' ||
          d.activityType === 'MaterialChange' ||
          d.activityType === 'ToolChange'
        ) {
          return '85%';
        } else if (d.activityType === 'Production') {
          return '58.3%';
        } else {
          return '20%';
        }
      }

      function position(d) {
        if (
          d.activityType === 'Production' ||
          d.activityType === 'CoilChange' ||
          d.activityType === 'Maintenance' ||
          d.activityType === 'Breakdown'
        ) {
          return '6';
        } else if (
          d.activityType === 'ToolAndMaterialChange' ||
          d.activityType === 'MaterialChange' ||
          d.activityType === 'MachineConfig' ||
          d.activityType === 'ToolChange'
        ) {
          return '7';
        } else if (d.activityType === 'Unscheduled') {
          return '-1';
        } else if (
          d.activityType === 'Break' ||
          d.activityType === 'Meeting'
        ) {
          return '0';
        } else {
          return '20';
        }
      }

      function textPosition(d) {
        if (d.activityType === 'Production') {
          return '34';
        } else if (d.activityType === 'MachineConfig') {
          return '55';
        }
      }

      function tspanPosition(d) {
        if (d.activityType === 'Production') {
          return '36';
        } else if (d.activityType === 'MachineConfig') {
          return '58';
        }
      }

      function zIndexMap(d) {
        if (
          d.activityType === 'Unscheduled' ||
          d.activityType === 'Break' ||
          d.activityType === 'Meeting'
        ) {
          return 5;
        } else if (d.activityType === 'Late') {
          return 4;
        } else if (
          d.activityType === 'CoilChange' ||
          d.activityType === 'Maintenance' ||
          d.activityType === 'Breakdown'
        ) {
          return 3;
        } else if (d.activityType === 'Production') {
          return 2;
        } else if (
          d.activityType === 'MaterialChange' ||
          d.activityType === '' ||
          d.activityType === 'MachineConfig' ||
          d.activityType === 'ToolChange' ||
          d.activityType === 'ToolAndMaterialChange'
        ) {
          return 1;
        } else {
          return 6;
        }
      }
      function searchTextMap(d) {
        return d.orderCode + d.materialCode + d.toolingCode;
      }
      function titleMap(d) {
        return d.orderCode + d.materialCode + d.toolingCode;
      }

      function setLeftColor(d) {
        if (d.activityType === 'Production') {
          return '#8CAB12';
        }
        if (d.activityType === 'MachineConfig') {
          return '#F68B1F';
        }
      }
      function setRightColor(d) {
        if (d.activityType === 'Production') {
          return '#BED75D';
        }
        if (d.activityType === 'MachineConfig') {
          return '#F1CE9F';
        }
      }

      function warningMap(d) {
        if (!Array.isArray(d) || !d.length) {
          return '';
        }
        return d
          .map(w => {
            return w.toLowerCase();
          })
          .join(' ');
      }

      //redraw chart content
      function draw() {
        let startDate = xValDomain[0];
        let endDate = xValDomain[1];
        if ($scope.data) {
          // Sort data by z index
          $scope.data.sort(function (x, y) {
            return d3.ascending(zIndexMap(x), zIndexMap(y));
          });

          // Data binding
          let timeBlocks = gMain
            .selectAll('svg')
            .data($scope.data, function (d: any) {
              if (
                endDate >= new Date(d.startDateTime) &&
                startDate <= new Date(d.endDateTime) &&
                xScale(new Date(d.endDateTime)) -
                xScale(new Date(d.startDateTime)) >=
                2
              ) {
                return d.id;
              }
            });

          // Handle objects that were just added to the collection
          let blocksEnter = timeBlocks
            .enter()
            .append('svg')
            .attr('y', 0)
            .attr('height', '100%')
            .on('mouseover', (d) => {
              tooltip
                .transition()
                .duration(200)
                .style('opacity', 1)
                .style('z-index', 1)
                .style('display', 'block');
              tooltip.html(tooltipMap(d));
            })
            .on('mousemove', (e) => {
              let tooltipHeight = tooltip[0][0].clientHeight;
              let tooltipWidth = tooltip[0][0].clientWidth;
              let graphInnerWidth =
                document.getElementById('graph-div').offsetWidth;
              let cursorPosition = d3.mouse(
                document.getElementById('graph-div')
              )[0];
              //tooltipPosOffset is initiated with 10px to show distance between cursor and tooltip.
              let tooltipPosOffset = 10;
              //checking if toottip will fit to right of cursor by comparing difference
              // between graph-div position and cursor position. If it is  less than tooltip width,
              // then changing tooltip position to left of cursor. Tooltip width was reduced
              // by another 20 px to make use of extra padding available for graph-div.
              if (graphInnerWidth - cursorPosition < tooltipWidth - 20) {
                tooltipPosOffset = -340;
              }
              return tooltip
                .style('top', (<any>d3.event).pageY - tooltipHeight + 'px')
                .style(
                  'left',
                  (<any>d3.event).pageX + tooltipPosOffset + 'px'
                );
            })
            .on('mouseout', (d) => {
              tooltip
                .transition()
                .style('z-index', 0)
                .duration(500)
                .style('display', 'none');
            })
            .on('dblclick', (d) => {
              if (
                d.activityType === 'MaterialChange' ||
                d.activityType === 'MachineConfig' ||
                d.activityType === 'Production' ||
                d.activityType === 'CoilChange'
              ) {
                tooltip
                  .transition()
                  .style('z-index', 0)
                  .style('display', 'none');
              }
              if (d.downtimeId) {
                $rootScope.$broadcast('openDowntimePopup', d);
              } else if (d.activityType === 'Production') {
                $state.go('app.orders.detail', { id: d.ordId });
              } else if (
                d.activityType === 'MaterialChange' ||
                d.activityType === 'MachineConfig' ||
                d.activityType === 'CoilChange'
              ) {
                $state.go('app.inventory.coil-types.coil-type', {
                  id: d.materialCode,
                });
              } else if (d.downtimeId !== '') {
                //what is this for?
                console.log('Downtime:' + d.downtimeId);
                //state.go('app.inventory.coil-types.coil-type', {id: d.materialCode});
              }
            });

          let defs = blocksEnter.append('defs');
          let filter = defs.append('filter').attr('id', function (d) {
            if (d.activityType === 'Breakdown') {
              return 'dropshadow';
            }
          });
          filter
            .append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('stdDeviation', '5 0');

          let gradient = defs
            .append('linearGradient')
            .attr('id', function (d) {
              return d.activityType + '_' + d.id;
            })
            .attr('x1', '0')
            .attr('x2', '1')
            .attr('y1', '0')
            .attr('y2', '0');
          //Linear gradient for timeblock objects
          // function setLeftColor(d) {
          //   if(d.activityType === 'Production'){
          //     return '#8CAB12';
          //   }
          //   if(d.activityType === 'MachineConfig'){
          //     return '#F68B1F';
          //   }
          // }
          // function setRightColor(d) {
          //   if(d.activityType === 'Production'){
          //     return '#BED75D';
          //   }
          //   if(d.activityType === 'MachineConfig'){
          //     return '#F1CE9F';
          //   }
          // }

          gradient
            .append('stop')
            .attr('offset', '0')
            .attr('stop-color', setLeftColor);

          gradient
            .append('stop')
            .attr('offset', '1')
            .attr('stop-color', setRightColor);

          // Handle objects that are no longer in the collection
          timeBlocks.exit().remove();

          blocksEnter
            .append('rect')
            .attr('x', 0)
            .attr('width', '100%')
            .attr('y', position)
            .attr('height', blockHeightMap)
            .attr('class', function (d) {
              //return cssClassMap(d);
              return (
                d.activityType.toLowerCase() +
                ' ' +
                d.state.toLowerCase() +
                ' ' +
                warningMap(d.warnings) +
                ' ' +
                d.id
              );
            })
            .style('filter', function (d) {
              if (d.activityType === 'Breakdown') {
                return 'url(#dropshadow)';
              }
            })
            .style('fill', function (d) {
              if (
                d.activityType === 'Production' ||
                d.activityType === 'MachineConfig'
              ) {
                return 'url(#' + d.activityType + '_' + d.id + ')';
              }
            });

          //Appending line to remove vertical green lines for back to back Unscheduled blocks

          // Right Line
          blocksEnter
            .append('line')
            .style('stroke', function (d) {
              if (d.activityType === 'Unscheduled' && d.showRightLine) {
                return '#8FAE17';
              }
            })
            .style('stroke-width', '2px')
            .style('opacity', '0.7')
            .attr('x1', '100%')
            .attr('y1', '0')
            .attr('x2', '100%')
            .attr('y2', '46%');

          // Left Line
          blocksEnter
            .append('line')
            .style('stroke', function (d) {
              if (d.activityType === 'Unscheduled' && d.showLeftLine) {
                return '#8FAE17';
              }
            })
            .style('stroke-width', '2px')
            .style('opacity', '0.7')
            .attr('x1', '0')
            .attr('y1', '0')
            .attr('x2', '0')
            .attr('y2', '46%');

          // Bottom Line
          blocksEnter
            .append('line')
            .style('stroke', function (d) {
              if (d.activityType === 'Unscheduled') {
                return '#8FAE17';
              }
            })
            .style('opacity', '0.7')
            .attr('y1', '46%')
            .attr('x2', '100%')
            .attr('y2', '46%');

          // Appending Text
          let texts = blocksEnter
            .append('text')
            .attr('y', textPosition)
            .attr('x', 5)
            .attr('dominant-baseline', 'text-before-edge');

          texts
            .append('tspan')
            .style('font-size', '14px')
            .style('fill', '#4b5a47')
            .style('font-weight', '600')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'Production') {
                return d.orderCode;
              }
            });
          texts
            .append('tspan')
            .attr('y', tspanPosition)
            .style('font-size', '11px')
            .style('fill', '#4b5a47')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'Production') {
                return d.customerName ? ' -' + d.customerName : '';
              }
            });
          texts
            .append('tspan')
            .attr('y', tspanPosition)
            .style('font-size', '11px')
            .style('fill', '#8e5715')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'MachineConfig') {
                return 'MATERIAL:';
              }
            });
          texts
            .append('tspan')
            .attr('y', textPosition)
            .style('font-size', '14px')
            .style('fill', '#8e5715')
            .style('font-weight', '600')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'MachineConfig') {
                return d.materialCode;
              }
            });
          texts
            .append('tspan')
            .attr('y', tspanPosition)
            .style('font-size', '11px')
            .style('fill', '#8e5715')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'MachineConfig') {
                return ' TOOLING:';
              }
            });
          texts
            .append('tspan')
            .attr('y', textPosition)
            .style('font-size', '14px')
            .style('fill', '#8e5715')
            .style('font-weight', '600')
            .style('cursor', 'default')
            .text(function (d) {
              if (d.activityType === 'MachineConfig') {
                return d.toolingCode;
              }
            });
          // Update existing objects
          timeBlocks
            .attr('x', function (d) {
              return xScale(new Date(d.startDateTime));
            })
            .attr('width', function (d) {
              return (
                xScale(new Date(d.endDateTime)) -
                xScale(new Date(d.startDateTime))
              );
            })
            .classed('muted', function (d) {
              let keysOfPrntObj = Object.keys(d);
              let searchString = '';
              for (let i = 0; i < keysOfPrntObj.length; i++) {
                if (
                  d[keysOfPrntObj[i]] &&
                  keysOfPrntObj[i] !== 'remainingFt' &&
                  keysOfPrntObj[i] !== 'totalFt'
                ) {
                  searchString += d[keysOfPrntObj[i]];
                }
              }
              return (
                $scope.searchText &&
                searchString &&
                !searchString
                  .toLowerCase()
                  .includes($scope.searchText.toLowerCase())
              );
            });
        }
      }

      draw();
    },
  };
}
