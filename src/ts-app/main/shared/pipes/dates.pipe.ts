import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

import { UnitsService } from '../services/units.service';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {
  constructor(private unitsService: UnitsService) {
  }
  transform(startDate, endDate): unknown {
      let dateIn = moment(startDate);
      if (!dateIn.isValid()) return '';

      let dateOut = moment(endDate);
      if (!dateOut.isValid()) {
          dateOut = moment(Date.now());
      }

      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      if (dateOut.isBefore('1980-01-02')) {
            dateOut = moment();
      }

      let age = dateOut.diff(dateIn, 'days');
      let units = ' d';
      if (age > 365) {
            age = this.unitsService.round(dateOut.diff(dateIn, 'years', true), 1);
            units = ' y';
      }
      return age + units;
  }
}

@Pipe({
  name: 'amsDate'
})
export class DatesPipe implements PipeTransform {
  transform(date): unknown {
      let dateIn = moment(date);
      if (!dateIn.isValid()) return '';
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      return dateIn.format('L');
  }
}

@Pipe({
  name: 'amsTime'
})
export class AmsTimePipe implements PipeTransform {
  transform(date): unknown {
    let dateIn = moment(date);
      if (!dateIn.isValid()) return '';
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('LTS');
  }
}

@Pipe({
  name: 'amsDateTime'
})
export class AmsDateTimePipe implements PipeTransform {
  transform(date): unknown {
      let dateIn = moment(date);
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      //todo:review this format
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('L') + ' ' + dateIn.format('LT');
  }
}

@Pipe({
  name: 'amsDateTimeSec'
})
export class AmsDateTimeSecPipe implements PipeTransform {
  transform(date): unknown {
      let dateIn = moment(date);
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      //todo:review this format
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('L') + ' ' + dateIn.format('LTS');
  }
}

@Pipe({
  name: 'amsTimeAgo'
})
export class AmsTimeAgoPipe implements PipeTransform {
  transform(date): unknown {
    let dateIn = moment(date);
    if (dateIn.isBefore('1980-01-02')) {
          return '';
    }
    return dateIn.fromNow(true);
  }
}

@Pipe({
  name: 'timeSpan'
})
export class TimeSpanPipe implements PipeTransform {
  transform(timeSpan, format): unknown {
    let timeSpanIn = moment.duration(timeSpan);
      if (!format){
        format = 'human';
      }
      //todo:add other formats (x H x M x S)
      //here's a way to do more formatting but I don't need it yet: moment.utc(timeSpanIn.asMilliseconds()).format('m:ss.SSS');
      switch (format) {
        case 'secondsWithMs' :
          return timeSpanIn.asSeconds().toFixed(3);
        case 'human':
        default:
          return timeSpanIn.humanize();
      }
  }
}

@Pipe({
  name: 'taskTimeAgo'
})
export class TaskTimeAgoPipe implements PipeTransform {
  transform(timeSpan, format): unknown {
      return ''
  }
}
