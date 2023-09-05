import * as moment from "moment";

toTrustedFilter.$inject = ['$sce']
export function toTrustedFilter($sce) {
    return function (value)
    {
        return $sce.trustAsHtml(value);
    };
}


export function htmlToPlainTextFilter() {
    return function (text)
    {
        return String(text).replace(/<[^>]+>/gm, '');
    };
}

export function nospaceFilter() {
    return function (value)
    {
        return (!value) ? '' : value.replace(/ /g, '');
    };
}

export function humanizeDocFilter() {
    return function (doc)
    {
        if ( !doc )
        {
            return;
        }
        if ( doc.type === 'directive' )
        {
            return doc.name.replace(/([A-Z])/g, function ($1)
            {
                return '-' + $1.toLowerCase();
            });
        }
        return doc.label || doc.name;
    };
}

//todo:move below to AMS filters file?
export function secondsToHourMinuteSecond() {  //this is not used. Keep around for a bit until we are sure that the timeAgo using moment is ok
    return function (totalSeconds) {
        if (typeof totalSeconds === 'undefined') {
            return '???';
        }
        // if (totalSeconds < 60) {
        //     return '';
        // }
        let m = moment().subtract(totalSeconds, 'seconds');
        let ago = m.fromNow(true);
        return ago;
//         let seconds = (totalSeconds % 60).toFixed(0);
//         let minutes = Math.floor(totalSeconds / 60) % 60;
//         let hours = Math.floor(totalSeconds / (60 * 60));
//         let days = Math.floor(totalSeconds / (60 * 60 * 24));
//
//         // Note: js evaluates the "truthiness" of lots of non-boolean "types".  Empty strings, zero values, nulls are all treated like FALSE
//         let outDays = days > 0 ? days + 'h ' : '';
//         let outHours = hours > 0 ? hours + 'h ' : '';
//         let outMinutes = minutes > 0 ? ((outHours ? '00' : '') + minutes).slice(-2) + 'm ' : '';    // pad with leading zero if there is an hour
//         let outSeconds = ((outMinutes ? '00' : '') + seconds).slice(-2) + 's';  // pad with leading zero if there is a minute
//         let out = outHours + outMinutes + (hours <= 0 ? outSeconds : '');
//         return out;
    };
}

timeAgo.$inject = ['$interval']
export function timeAgo($interval) {
    $interval(function(){},1000);
    function timeAgoFilter(lastRunStateChange) {
        let m = moment(lastRunStateChange);
        let ago = m.fromNow(true);
        return ago;
    }
    timeAgoFilter.$stateful = true;
    return timeAgoFilter;
}

export function checkFilter() {
   return function (items: any[], isChecked: boolean = false)
   {
      return items.filter(item => item.isChecked === isChecked);
   };
}
