import * as moment from 'moment';

const DurationDisplay = {
   selector: "durationDisplay",
   template: `<span ng-bind-html="$ctrl.output" />`,
   bindings: {
      date: '<',
      seconds: '<',
      milliseconds: '<',
      resolution: '<'
   },
   controller: ['$interval', class DurationDisplay {
      date: string;
      seconds: number;
      milliseconds: number;
      resolution: number;
      output: string;
      interval: any;

      constructor(
         private $interval
      ) { }

      private calculateDateParts() {
         let diffTime = 0;
         if (this.date) {
           let nowMoment = moment();
           let oldMoment = moment(this.date);
           diffTime = Math.abs(nowMoment.diff(oldMoment, 'seconds')); // This might need to remember +/- but for now it works as expected
         } else
         if (this.milliseconds > 0) {
          diffTime = this.milliseconds / 1000;
         } else 
         if (this.seconds > 0) {
          diffTime = this.seconds;
         }
         let secondRes = this.resolution ?? 5;
         let remain = diffTime;
         let months = Math.floor(remain/2592000);
         remain -= months * 2592000;
         let days = Math.floor(remain/86400);
         remain -= days * 86400;
         let hours = Math.floor(remain/3600) % 24;
         remain -= hours * 3600;
         let minutes = Math.floor(remain/60) % 60;
         remain -= minutes * 60;
         let seconds = Math.floor(remain%60/secondRes)*secondRes;
   
         this.output = this.calculateOutput(months, days, hours, minutes, seconds);
       }
   
       private calculateOutput(months, days, hours, minutes, seconds) {
         if (months > 240) { //really old, show nothing
           return '';
         }
         if (months > 0){
           return `${months}<span class='time-sign'>MON</span>`;
         }
         if (days > 0){
           return `${days}<span class='time-sign'>D&nbsp;</span>${hours}<span class='time-sign'>H</span>`;
         }
         if (hours > 0){
           return `${hours}<span class='time-sign'>H&nbsp;</span>${minutes}<span class='time-sign'>M</span>`;
         }
         if (minutes > 0){
           return `${minutes}<span class='time-sign'>M&nbsp;</span>${seconds}<span class='time-sign'>S</span>`;
         }
         if (seconds >= 0){
           return `${seconds}<span class='time-sign'>S</span>`;
         }
         return '';
       }

      $onChanges() {
         this.calculateDateParts();
      }

      $onInit() {
         this.interval = this.$interval(() => {
            this.calculateDateParts();
         }, 500);
      }

      $onDestroy() {
         this.$interval.cancel(this.interval);
      }

   }],
};

export default DurationDisplay;
