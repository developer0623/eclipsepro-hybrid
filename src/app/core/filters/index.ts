import { module } from 'angular';
import {
    toTrustedFilter,
    htmlToPlainTextFilter,
    nospaceFilter,
    humanizeDocFilter,
    secondsToHourMinuteSecond,
    timeAgo,
    checkFilter
} from './basic.filter';
import { camelCaseFilter } from './camelcase.filter';
import { filterMachineNames, buildDuration, repeatText } from './dashboard.filter';
import {
    ageFilter,
    dateFilter,
    dateTimeFilter,
    timeAgoFilter,
    timeSpanFilter,
    taskTimeFilter,
    taskActiveFilter,
    taskCompleteFilter,
    timeFilter,
    dateTimeWithSecFilter
} from './dates.filter';
import { dynamicFilterFilter } from './dynamicFilter.filter';
import { orderStatusFilter } from './enum.filter';
import { configTypeFilter } from './integrationType.filter';
import { filterByTags, filterSingleByTags } from './tag.filter';
import { unitsFormatFilter, userDisplayUnitsFilter, unitsValueFilter, taskLenghFilter } from './units.filter';

export default module('app.core.filters', [])
.filter('toTrusted', toTrustedFilter)
.filter('htmlToPlaintext', htmlToPlainTextFilter)
.filter('nospace', nospaceFilter)
.filter('humanizeDoc', humanizeDocFilter)
.filter('secondsToHourMinuteSecond', secondsToHourMinuteSecond)
.filter('timeAgo', timeAgo)
.filter('camelCase', camelCaseFilter)
.filter('filterMachines', filterMachineNames)
.filter('buildDuration', buildDuration)
.filter('repeatText', repeatText)
// date filter
.filter('age', ageFilter)
.filter('amsDate', dateFilter)
.filter('amsTime', timeFilter)
.filter('amsDateTime', dateTimeFilter)
.filter('amsDateTimeSec', dateTimeWithSecFilter)
.filter('amsTimeAgo', timeAgoFilter)
.filter('timeSpan', timeSpanFilter)
.filter('taskTimeAgo', taskTimeFilter)
.filter('taskActiveAgo', taskActiveFilter)
.filter('taskCompleteAgo', taskCompleteFilter)
// enum filter
.filter('orderStatus', orderStatusFilter)
// integration type filter
.filter('configType', configTypeFilter)
// tag filter
.filter('filterByTags', filterByTags)
.filter('filterSingleByTags', filterSingleByTags)
// units filter
.filter('unitsFormat', unitsFormatFilter)
.filter('userDisplayUnits', userDisplayUnitsFilter)
.filter('unitsValue', unitsValueFilter)
.filter('taskLenghValue', taskLenghFilter)
.filter('dynamicFilter', dynamicFilterFilter)
.filter('checkFilter', checkFilter)
.name;
