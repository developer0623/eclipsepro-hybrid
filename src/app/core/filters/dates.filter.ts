import * as moment from "moment";


interface StatefulFunction {
  (): string;
  $stateful: boolean;
}

ageFilter.$inject = ['$filter', 'unitsService']
export function ageFilter($filter, unitsService) {
    return function (startDate, endDate) {
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
            age = unitsService.round(dateOut.diff(dateIn, 'years', true), 1);
            units = ' y';
      }
      return age + units;
    };
}

dateFilter.$inject = ['$filter']
export function dateFilter($filter) {
    return function (date) {
      let dateIn = moment(date);
      if (!dateIn.isValid()) return '';
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      return dateIn.format('L');
    };
}

timeFilter.$inject = ['$filter']

export function timeFilter($filter) {
    return function (date) {
      let dateIn = moment(date);
      if (!dateIn.isValid()) return '';
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('LTS');
    };
}

dateTimeFilter.$inject = ['$filter']
export function dateTimeFilter($filter) {
    return function (date) {
      let dateIn = moment(date);
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      //todo:review this format
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('L') + ' ' + dateIn.format('LT');
    };
}

dateTimeWithSecFilter.$inject = ['$filter']
export function dateTimeWithSecFilter($filter) {
    return function (date) {
      let dateIn = moment(date);
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      //todo:review this format
      dateIn.add(0.5,'seconds').startOf('second'); //round to nearest second
      return dateIn.format('L') + ' ' + dateIn.format('LTS');
    };
}

timeAgoFilter.$inject = ['$filter']
export function timeAgoFilter($filter) {
    return function (date) {
      let dateIn = moment(date);
      if (dateIn.isBefore('1980-01-02')) {
            return '';
      }
      return dateIn.fromNow(true);
    };
}

timeSpanFilter.$inject = ['$filter'];
export function timeSpanFilter($filter) {
    return function (timeSpan, format) {
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
    };
}

taskTimeFilter.$inject = ['$interval'];

export function taskTimeFilter($interval) {
  $interval(function(){},5000);
  const timebefore = <StatefulFunction>function(lastRunStateChange) {
        let nowMoment = moment();
        let oldMoment = moment(lastRunStateChange);
        let diffTime = oldMoment.diff(nowMoment, 'minutes');

        if (!diffTime){
          return '';
        }

        if(diffTime >= 0) {
        if(diffTime < 10) {
          return `<span class='red-color'>${diffTime}<span class='time-sign'>M</span></span>`;
        }
        if(diffTime < 60 ){
          return `<span class='normal-color'>${diffTime}<span class='time-sign'>M</span></span>`;
        }
        if(diffTime < 1440 ){
          let hours = Math.floor(diffTime/60);
          let minutes = diffTime % 60;
          return `<span class='normal-color'>${hours}<span class='time-sign'>H</span> ${minutes}<span class='time-sign'>M</span></span>`;
        }
        if(diffTime < 43200){
            let days = Math.floor(diffTime/1440) + 1;
            return `<span class='normal-color'>${days}<span class='time-sign'>D</span></span>`;
        }
        let months = Math.floor(diffTime/43200) + 1;
        return `<span class='normal-color'>${months}<span class='time-sign'>MON</span></span>`;
      }
      else{
        if(diffTime >= -60 ){
          let newDiff = Math.abs(diffTime);
          return `<span class='red-color'><span class='late-sign'>late</span>${newDiff}<span class='time-sign'>M</span></span>`;
        }
        if(diffTime >= -1440 ){
        let newDiff = Math.abs(diffTime);
        let hours = Math.floor(newDiff/60);
        let minutes = newDiff % 60;
        return `<span class='red-color'><span class='late-sign'>late</span>${hours}<span class='time-sign'>H</span> ${minutes}<span class='time-sign'>M</span></span>`;
        }
        if(diffTime >= -43200){
          let newDiff = Math.abs(diffTime);
          let days = Math.floor(newDiff/1440) + 1;
          return `<span class='red-color'><span class='late-sign'>late</span>${days}<span class='time-sign'>D</span></span>`;
        }
        let newDiff = Math.abs(diffTime);
        let months = Math.floor(newDiff/43200) + 1;
        return `<span class='red-color'><span class='late-sign'>late</span>${months}<span class='time-sign'>MON</span></span>`;
      }
  }
  timebefore.$stateful = true;
  return timebefore;
}

taskActiveFilter.$inject = ['$interval'];
export function taskActiveFilter($interval) {
  $interval(function(){},1000);
  const timebefore = <StatefulFunction>function(lastRunStateChange) {
    let nowMoment = moment();
    let oldMoment = moment(lastRunStateChange);
    let diffTime = nowMoment.diff(oldMoment, 'seconds');
    let secondRes = 5; //todo: parameterize

    if(!diffTime || diffTime <= 0){
      return '';
    }

    let remain = diffTime;
    let months = Math.floor(remain/2592000);
    remain -= months * 2592000;
    let days = Math.floor(remain/86400);
    remain -= days * 86400;
    let hours = Math.floor(remain/3600) % 24;
    remain -= hours * 3600;
    let minutes = Math.floor(remain/60) % 60;
    remain -= minutes * 60;
    let seconds = Math.floor(remain%60/secondRes)*secondRes; // rem % 60/secondRes*secondRes;

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
  timebefore.$stateful = true;
  return timebefore;
}

export function taskCompleteFilter() {
  function timebefore(completedDate, startDate) {
        let nowMoment = moment(startDate);
        let oldMoment = moment(completedDate);
        let diffTime = oldMoment.diff(nowMoment, 'minutes');
        let newText = '';
        if(diffTime < 60 && diffTime >= 0) {
          newText = `${diffTime}<span class='time-sign'>M</span>`;
        } else if(diffTime >= 60 && diffTime < 1440 ){
          let hours = Math.floor(diffTime/60);
          let minutes = diffTime % 60;
          newText = `${hours}<span class='time-sign'>H</span> ${minutes}<span class='time-sign'>M</span>`;
        } else if(diffTime >= 1440 && diffTime < 43200){
          let days = Math.floor(diffTime/1440) + 1;
          newText = `${days}<span class='time-sign'>D</span>`;
        } else if(diffTime >= 43200){
          let months = Math.floor(diffTime/43200) + 1;
          newText = `${months}<span class='time-sign'>MON</span>`;
        }

        return newText;
  }
  return timebefore;
}
