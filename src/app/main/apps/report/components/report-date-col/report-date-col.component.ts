import * as moment from 'moment';
import { ReportService } from '../../../../../core/services/report.service';
import Temp from './report-date-col.component.html';

import { DurationType } from '../../report-type';
import { initDate } from '../../common';

const ReportDateCol_ = {
  selector: 'reportDateCol',
  bindings: {
    startDate: '<',
    endDate: '<',
    duration: '<',
    onChange: '&',
  },
  template: Temp,
  /** @ngInject */
  controller: class ReportDateColComponent {
    startDate: Date;
    endDate: Date;
    duration: DurationType;
    onChange: ({ startDate, endDate }) => any;

    startMaxDate = moment().add(-1, 'd').toDate();
    endMaxDate = new Date();
    constructor() {
    }

    compareDates(newDate, oldDate) {
      return moment(newDate).isAfter(oldDate);
    }

    onChangeStartDate() {
      this.endDate = this.compareDates(this.startDate, this.endDate)
        ? this.startDate
        : this.endDate;
      if (this.duration !== 'day') {
        const result = initDate(
          this.startDate,
          this.endDate,
          this.duration
        );
        this.startDate = result.startDate;
        this.endDate = result.endDate;
      }
      this.onChange({ startDate: this.startDate, endDate: this.endDate });
    }

    onChangeEndDate() {
      this.startDate = this.compareDates(this.startDate, this.endDate)
        ? this.endDate
        : this.startDate;
      if (this.duration !== 'day') {
        const result = initDate(
          this.startDate,
          this.endDate,
          this.duration
        );
        this.startDate = result.startDate;
        this.endDate = result.endDate;
      }
      this.onChange({ startDate: this.startDate, endDate: this.endDate });
    }

    // next and prev button
    onChangeDate(step) {
      const mStartDate = moment(this.startDate);
      const mEnddate = moment(this.endDate);
      if (this.duration === 'week') {
        this.startDate = mStartDate.add(step, 'w').toDate();
        this.endDate = mEnddate.add(step, 'w').toDate();
      } else if (this.duration === 'month') {
        this.startDate = mStartDate.add(step, 'M').toDate();
        this.endDate = mEnddate.add(step, 'M').toDate();
      } else {
        this.startDate = mStartDate.add(step, 'd').toDate();
        this.endDate = mEnddate.add(step, 'd').toDate();
      }
      this.onChange({ startDate: this.startDate, endDate: this.endDate });
    }

    onlyAllowDate(date) {
      const day = date.getDay();
      if (this.duration === 'week') {
        return day === 0;
      }
      return true;
    }

    onlyAllowEndDate(date) {
      const day = date.getDay();
      if (this.duration === 'week') {
        return day === 6;
      }
      return true;
    }

    $onChanges(changes) {
      if (changes.duration) {
        const result = initDate(
          this.startDate,
          this.endDate,
          this.duration
        );
        this.startDate = result.startDate;
        this.endDate = result.endDate;
      }
    }
  },
};

export default ReportDateCol_;
