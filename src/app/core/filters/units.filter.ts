unitsFormatFilter.$inject = ['$filter', 'unitsService']
export function unitsFormatFilter($filter, unitsService) {
    return function (input, inType, decimals, hideUnit, shortenTo, outType) {
        if(!shortenTo) {
            return unitsService.formatUserUnits(input, inType, decimals, hideUnit, outType);
        }
        else {
            return unitsService.shortenBigNumber(input, inType, shortenTo);
        }
    };
}

userDisplayUnitsFilter.$inject = ['$filter', 'unitsService']
export function userDisplayUnitsFilter($filter, unitsService) {
    return function (type) {
        return unitsService.getUserDisplayUnits(type);
    };
}

unitsValueFilter.$inject = ['$filter', 'unitsService']
export function unitsValueFilter($filter, unitsService) {
    return function (input, inType, decimals) {
        if(!input) { return 0; }

        return unitsService.convertUnits(input, inType, decimals);
    };
}

taskLenghFilter.$inject = ['$filter', 'unitsService']
export function taskLenghFilter($filter) {
    return function (input) {
        if(!input) { return 0; }

        return Math.round(input);
    };
}
