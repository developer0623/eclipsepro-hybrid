import angular from 'angular';

export function filterMachineNames() {
    let cached = {};
    return function (input, machineList) {
            if (input) {
            if (input in cached) {
                return typeof cached[input] === 'string' ? cached[input] : undefined;
            } else {
                let machines = [];
                angular.forEach(input, function(downtimeMachineId) {
                    if (machineList[downtimeMachineId]) {
                        machines.push(machineList[downtimeMachineId].description);
                    } else {
                        machines.push('Machine ID ' + downtimeMachineId + ' (Error ID not valid!)');
                    }
                    });
                cached[input] = machines.join(', ');
            }
        }
    };
}

export function buildDuration(){
    return function (input, isDuration) {
        if(typeof input === "undefined"){
            return {};
        }
        if(isDuration === 'true'){
            let formattedDuration:any = {};
            input = input.split(':');
            formattedDuration.hours = input[0] === '00' ? 0 : parseInt(input[0]);
            formattedDuration.mins = input[1] === '00' ? 0 : parseInt(input[1]);
            formattedDuration = (formattedDuration.hours > 0 ? parseInt(formattedDuration.hours)+' Hours ': '') +(formattedDuration.mins >0 ? parseInt(formattedDuration.mins)+' Mins' : '');
            return formattedDuration;
        }else if(isDuration === 'false'){
            let formattedTime:any = {};
            input = input.split(':');
            formattedTime.hours = parseInt(input[0]) > 12 ? parseInt(input[0])-12 : parseInt(input[0]) === 0 ? '12' : parseInt(input[0]);
            formattedTime.hours = formattedTime.hours < 10 ? '0'+ formattedTime.hours : formattedTime.hours;
            formattedTime.mins = input[1];
            formattedTime.meridian =  input[0] >= 12 ? 'PM' : 'AM';
                formattedTime = parseInt(formattedTime.hours)+':'+formattedTime.mins+' '+ formattedTime.meridian;
            return formattedTime;
        }
    };
}

repeatText.$inject = ['eclipseProHelper']
export function repeatText(eclipseProHelper){
    return function (input) {
        return eclipseProHelper.buildRepeatText(input);
    };
}
