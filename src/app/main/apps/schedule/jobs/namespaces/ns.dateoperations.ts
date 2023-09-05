namespace DateNamespace {
  export function getDayOfWeek(day: number) {
    switch (day) {
      case 0:
        return 'SU';
      case 1:
        return 'MO';
      case 2:
        return 'TU';
      case 3:
        return 'WE';
      case 4:
        return 'TH';
      case 5:
        return 'FR';
      case 6:
        return 'SA';
    }
  }

  export function getDateOfDate(dateInput) {
    let date = parseInt(dateInput);
    return date < 10 ? '0' + date : date;
  }

  export function getMonth(monthInput) {
    let month = parseInt(monthInput) + 1;
    return month < 10 ? '0' + month : month;
  }

  export function getRemainingRunTime(timePeriod) {
    let dateObj = getTimeDetails(timePeriod);
    let totalTime =
      '<strong>' +
      parseInt(dateObj['days'].toString()) +
      "</strong> <sub class='bottom-0'>DAY</sub> <strong>" +
      parseInt(dateObj['hours'].toString()) +
      "</strong> <sub class='bottom-0'>HR</sub> <strong>" +
      parseInt(dateObj['minutes'].toString()) +
      "</strong> <sub class='bottom-0'>MIN</sub>";
    return totalTime;
  }

  export function getExpectedCompletedDateTime(timePeriod) {
    let dateObj = getTimeDetails(timePeriod);
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + dateObj['days']);
    currentDate.setHours(currentDate.getHours() + dateObj['hours']);
    currentDate.setMinutes(currentDate.getMinutes() + dateObj['minutes']);
    let monthValue = currentDate.getMonth() + 1;
    let month = monthValue > 9 ? monthValue : '0' + monthValue;
    let dateValue = currentDate.getDate();
    let date = dateValue > 9 ? dateValue : '0' + dateValue;
    return (
      month +
      ' / ' +
      date +
      ' / ' +
      currentDate.getFullYear() +
      ' ' +
      currentDate.getHours() +
      ':' +
      currentDate.getMinutes()
    );
  }

  function getTimeDetails(timePeriod) {
    let milliSeconds = parseInt(timePeriod) * 1000;
    let dataObj = {};
    dataObj['days'] = milliSeconds / 86400000;
    dataObj['hours'] = (milliSeconds % 86400000) / 3600000;
    dataObj['minutes'] = ((milliSeconds % 86400000) % 3600000) / 60000;
    return dataObj;
  }
}
