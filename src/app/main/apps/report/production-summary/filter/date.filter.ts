import * as moment from 'moment';

export function numberFilter() {
  return function (val) {
    val = Number(val);
    return val.toFixed(2);
  }
}   

export function summarPercentFilter() {
  return function (val) {
    val = Number(val) * 100;          
    return val.toFixed(1);
  }; 
}

export function timebarPercentFilter() {
  return function (val) {
    val = Number(val) * 100;          
    return val.toFixed(2);
  }; 
}

export function printDateFilter() {
  function timebefore(startDate, endDate, state) {
    const startMoment = moment(startDate);
    const startDay = startMoment.format('DD');
    const startMonth = startMoment.format('MMM');
    const startYear = startMoment.format('YYYY');

    const endMoment = moment(endDate);            
    const endDay = endMoment.format('DD');
    const endMonth = endMoment.format('MMM');
    const endYear = endMoment.format('YYYY');

    let newText = '';
    if(state === 'Day') {
      newText = `${endMonth} ${endDay}<span>${endYear}</span>`;
    } else if(state === 'Month'){
      newText = `${endMonth}<span>${endYear}</span>`;
    }
      else {
      if (startYear === endYear) {
        newText = `${startMonth} ${startDay} - ${endMonth} ${endDay} <span>${endYear}</span>`;
      } else {
        newText = `${startMonth} ${startDay} <span>${startYear}</span> - ${endMonth} ${endDay} <span>${endYear}</span>`;
      }
    }
    return newText;
  }
  return timebefore;
}

export function productionDateSummaryFilter() {
  function timebefore(startDate, endDate, state) {
      const startMoment = moment(startDate);
      const startDay = startMoment.format('DD');
      const startMonth = startMoment.format('MMM');
      const startYear = startMoment.format('YYYY');

      const endMoment = moment(endDate);            
      const endDay = endMoment.format('DD');
      const endMonth = endMoment.format('MMM');
      const endYear = endMoment.format('YYYY');

      let newText = '';
      switch (state) {
        case 'Week':
        {
          const weekOfEndDate = endMoment.format("w");
          if(startMonth === endMonth) {
            newText = `${startMonth} ${startDay} - ${endDay}`;
          } else {
            newText = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
          }
          newText+= ` <span class="center-child">week:</span> ${weekOfEndDate} <span class="last-child">OF ${endYear}</span>`;
          break;
        }
        case 'Month':
        {
          newText = `${startMonth} ${startYear}`;
          break;
        }
        
        case 'Custom':
        {
          const endDayOfWeek = endMoment.format('dd');
          const startDayOfWeek = startMoment.format('dd');
          newText =`<span class='first-child'>${startDayOfWeek}:</span>${startMonth} ${startDay}  -  <span class='first-child'>${endDayOfWeek}:</span>${endMonth} ${endDay}<span class='last-child'>${endYear}</span>`;
          break;
        }
        
        default:
        {
          const endDayOfWeek = endMoment.format('dddd');
          newText =`<span class='first-child'>${endDayOfWeek},</span>${endMonth} ${endDay}<span class='last-child'>${endYear}</span>`;
          break;
        }
      }
      

        return newText;
  }
  return timebefore;
}