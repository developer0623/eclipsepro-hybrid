import angular from 'angular';
import MobileDetect from 'mobile-detect';

eclipseProHelperService.$inject = ['$q'];
export function eclipseProHelperService($q) {
    // Private variables
    let mobileDetect = new MobileDetect(window.navigator.userAgent);
    let deferred = $q.defer();
    let service = {
        isMobile: isMobile,
        buildRepeatText: buildRepeatText,
        buildDuration: buildDuration,
        buildStartTime: buildStartTime
    };

    return service;

    //////////

    /**
     * Return if current device is a
     * mobile device or not
     */
    function isMobile() {
        return mobileDetect.mobile();
    }

    function buildRepeatText(downtimeData) {
        let repeatText = '';
        if (downtimeData.occurs === 'Daily') {
            repeatText = 'Daily : Every ' + (downtimeData.everyCount > 1 ? downtimeData.everyCount : '') + (downtimeData.everyCount > 1 ? ' Days' : 'Day');
        }

        if (downtimeData.occurs === 'Weekly') {
            repeatText = 'Weekly : Every ' + (downtimeData.everyCount > 1 ? downtimeData.everyCount : '') + (downtimeData.everyCount > 1 ? ' weeks on ' : 'week on ') + downtimeData.daysOfWeek.join(', ').replace(/,(?!.*,)/gmi, ' and');
        }

        if (downtimeData.occurs === 'Monthly') {
            let datesWithSuffix = [];
            if (downtimeData.monthValue === 'Each') {
                downtimeData.selectedDate = downtimeData.selectedDate.sort(function (a, b) { return a - b; });
                angular.forEach(downtimeData.selectedDate, function (selectedDate) {
                    let j = selectedDate % 10,
                        k = selectedDate % 100;
                    if (j === 1 && k !== 11) {
                        datesWithSuffix.push(selectedDate + 'st');
                    } else if (j === 2 && k !== 12) {
                        datesWithSuffix.push(selectedDate + 'nd');
                    } else if (j === 3 && k !== 13) {
                        datesWithSuffix.push(selectedDate + 'rd');
                    } else {
                        datesWithSuffix.push(selectedDate + 'th');
                    }
                });
            }

            if (downtimeData.weekDayOfMonth === 'WeekendDay') {
                downtimeData.weekDayOfMonth = 'Weekend Day';
            } else if (downtimeData.weekDayOfMonth === 'WeekDay') {
                downtimeData.weekDayOfMonth = 'Week Day';
            }
            repeatText = 'Monthly : Every ' + (downtimeData.everyCount > 1 ? downtimeData.everyCount : '') + (downtimeData.everyCount > 1 ? ' Months on ' : 'Month on the ') + (downtimeData.monthValue === 'Each' ? datesWithSuffix.join(', ').replace(/,(?!.*,)/gmi, ' and') : downtimeData.dayOfMonth + ' ' + downtimeData.weekDayOfMonth);
        }

        if (downtimeData.occurs === 'OneTime') {
            repeatText = 'One Time';
        }
        return repeatText;
    }

    function buildDuration(duration) {
        let formattedDuration: any = {};
        duration = duration.split(':');
        formattedDuration.hours = duration[0] === '00' ? 0 : parseInt(duration[0]);
        formattedDuration.mins = duration[1] === '00' ? 0 : parseInt(duration[1]);
        return formattedDuration;
    }

    function buildStartTime(startTime) {
        let formattedTime: any = {};
        startTime = startTime.split(':');
        formattedTime.hours = startTime[0] > 12 ? parseInt(startTime[0]) - 12 : parseInt(startTime[0]) === 0 ? '12' : parseInt(startTime[0]);
        formattedTime.hours = formattedTime.hours < 10 ? '0' + formattedTime.hours : formattedTime.hours;
        formattedTime.mins = startTime[1];
        formattedTime.meridian = startTime[0] >= 12 ? 'PM' : 'AM';
        return formattedTime;
    }

}
