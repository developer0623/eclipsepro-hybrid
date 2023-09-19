import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
declare let d3: any;

@Component({
  selector: 'app-timeline-xaxis',
  templateUrl: './timeline-xaxis.component.html',
  styleUrls: ['./timeline-xaxis.component.scss']
})
export class TimelineXAxisComponent implements OnInit, OnChanges, OnDestroy {
  @Input() displayXDomain;
  @Input() height = 100;
  @Input() width = 0;
  @Input() cursorTime;
  @ViewChild('timelineSvg', { static: true }) timelineSvg: ElementRef;
  private eventSubscription: Subscription;
  drawFlag: boolean = false;
  paddingTop: number = 0;
  paddingRight: number = 0;
  paddingBottom: number = 40;
  paddingLeft: number = 0;
  scaleWidth: number = 0;
  scaleHeight: number = 0;
  xValDomain: any[] = [];
  xScale: any;
  customTimeFormat: any;
  xAxis: any;
  svg: any;
  gChart: any;
  gxAxis: any;
  gMain: any;
  gCursor: any;

  constructor(private elementRef: ElementRef, private eventService: EventService) {}

  ngOnInit() {
    const svgElement = this.timelineSvg.nativeElement;
    this.width = this.width || svgElement.clientWidth;
    this.scaleWidth = this.width - this.paddingLeft - this.paddingRight;
    this.scaleHeight = this.height - this.paddingTop - this.paddingBottom;
    this.xValDomain = this.displayXDomain;
    // this.xScale = d3.scaleTime().range([0, this.scaleWidth]).domain(this.xValDomain);
    this.xScale = d3.time.scale().range([0, this.scaleWidth]).domain(this.xValDomain);
    this.customTimeFormat = d3.time.format.multi([
      ['.%L', (d: any) => d.getMilliseconds()],
      [':%S', (d: any) => d.getSeconds()],
      ['%I:%M', (d: any) => d.getMinutes()],
      ['%I %p', (d: any) => d.getHours()],
      ['%a %d', (d: any) => d.getDay() && d.getDate() !== 1],
      ['%b %d', (d: any) => d.getDate() !== 1],
      ['%B', (d: any) => d.getMonth()],
      ['%Y', () => true],
    ]);
    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .orient('bottom')
      .tickFormat(this.customTimeFormat);

    this.svg = d3.select(svgElement).attr('width', this.width)
      .attr('height', this.height)
      .attr('font-size', '10');


    this.svg.append('defs').append('clipPath').attr('id', 'clip').append('rect')
      .attr('width', this.scaleWidth)
      .attr('height', '100%');

    this.gChart = this.svg.append('g')
      .attr('transform', 'translate(' + this.paddingLeft + ',' + this.paddingTop + ')')
      .attr('width', this.scaleWidth)
      .attr('height', this.scaleHeight)
      .attr('clip', 'url(#clip)');

    this.gxAxis = this.gChart.append('g')
      .attr('class', 'xAxis')
      .attr('transform', 'translate(0,' + this.scaleHeight + ')');

    this.gMain = this.gChart.append('g')
      .attr('class', 'main')
      .attr('height', this.scaleHeight);

    this.gCursor = this.gMain.append('g')
      .attr('class', 'cursor')
      .append('line')
      .attr('y1', 0.0)
      .attr('y2', this.height);

    this.drawCursor();
    this.eventSubscription = this.eventService.getEvent().subscribe(event => {
      this.xValDomain = event.data;
      this.xScale.domain(this.xValDomain);
      this.draw();
    });

    setInterval(() => this.advanceCursorTime(), 1000);
  }

  drawCursor() {
    const x = this.xScale(this.cursorTime);

    this.gCursor.attr('x1', x);
    this.gCursor.attr('x2', x);
  }

  advanceCursorTime() {
    this.cursorTime = new Date();
    this.draw();
  }

  draw() {
    this.drawCursor();
    this.xAxis.scale(this.xScale);
    this.gxAxis.call(this.xAxis);

    if (this.drawFlag) {
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
      let xDomainWidth = this.xValDomain[1] - this.xValDomain[0];

      if (xDomainWidth / (this.scaleWidth / tickSpanMs) <= 1000) {
        //format is hh:mm:ss.mmm
        tickStep = xDomainWidth / (this.scaleWidth / tickSpanMs);
        tickRoundMs = 1;
      } else if (
        xDomainWidth / (this.scaleWidth / tickSpan100Ms) <=
        1 * 60 * 1000
      ) {
        //format is hh:mm:ss.m
        tickStep = xDomainWidth / (this.scaleWidth / tickSpan100Ms);
        tickRoundMs = 100;
      } else if (
        xDomainWidth / (this.scaleWidth / tickSpanS) <=
        1 * 3600 * 1000
      ) {
        //format is hh:mm:ss
        tickStep = xDomainWidth / (this.scaleWidth / tickSpanS);
        tickRoundMs = 1000;
      } else {
        //format is hh:mm
        tickStep = xDomainWidth / (this.scaleWidth / tickSpanMin);
        tickRoundMs = 1000 * 60;
      }

      //offset tickStep/2 tick width, avoid first or last tick label outside of chart
      let ticks = d3
        .range(
          this.xValDomain[0].getTime() + tickStep / 2,
          this.xValDomain[1].getTime() - tickStep / 2,
          tickStep
        )
        .map(function (d) {
          d = Math.round(d / tickRoundMs) * tickRoundMs;
          return new Date(d);
        });

      let zxAxis = d3.svg
        .axis()
        .scale(this.xScale)
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cursorTime && changes.cursorTime.currentValue) {
      console.log('111111', this.cursorTime)
      // this.draw()
    }
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
}
