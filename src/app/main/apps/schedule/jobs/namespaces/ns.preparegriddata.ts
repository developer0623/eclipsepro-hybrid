import angular from 'angular';
import { Sch } from '../../../../../core/services/jobs.service.types';

export namespace GridData {
  export function updateSequenceNumber(
    scheduledJobs,
    job,
    sequenceNumber,
    jobItem
  ) {
    let previousJob = undefined;
    let resultObject = {};
    let scheduledJobsLength = scheduledJobs.length;
    for (let index = 0; index < scheduledJobsLength; index++) {
      let currentJob = scheduledJobs[index];
      if (
        typeof previousJob === 'undefined' &&
        currentJob['sequenceNum'] === sequenceNumber
      ) {
        if (currentJob['isOnMachine']) {
          resultObject['status'] = false;
          resultObject['data'] = [];
          return resultObject;
        }
        previousJob = job;
      }
      if (currentJob['sequenceNum'] >= sequenceNumber) {
        previousJob['sequenceNum'] = currentJob['sequenceNum'];
        scheduledJobs[index] = previousJob;
        sequenceNumber = currentJob['sequenceNum'];
        previousJob = currentJob;
      }
    }
    if (typeof previousJob === 'undefined') {
      previousJob = job;
    }
    if (typeof sequenceNumber === 'undefined') {
      sequenceNumber = jobItem['sequenceNum'];
    }
    previousJob['sequenceNum'] = sequenceNumber + 1;
    scheduledJobs.push(previousJob);
    resultObject['status'] = true;
    resultObject['data'] = scheduledJobs;
    return resultObject;
  }

  export function updateSequenceNumberOnMachine(
    scheduledJobs,
    job,
    sequenceNumber,
    jobItem
  ) {
    let previousJob = undefined;
    let resultObject = {};
    sequenceNumber += 1;
    let scheduledJobsLength = scheduledJobs.length;
    for (let index = 0; index < scheduledJobsLength; index++) {
      let currentJob = scheduledJobs[index];
      if (
        typeof previousJob === 'undefined' &&
        currentJob['sequenceNum'] === sequenceNumber
      ) {
        job['isOnMachine'] = true;
        previousJob = job;
      }
      if (currentJob['sequenceNum'] >= sequenceNumber) {
        previousJob['sequenceNum'] = currentJob['sequenceNum'];
        scheduledJobs[index] = previousJob;
        sequenceNumber = currentJob['sequenceNum'];
        previousJob = currentJob;
      }
    }
    if (typeof previousJob === 'undefined') {
      previousJob = job;
    }
    if (typeof sequenceNumber === 'undefined') {
      sequenceNumber = jobItem['sequenceNum'];
    }
    previousJob['sequenceNum'] = sequenceNumber + 1;
    scheduledJobs.push(previousJob);
    resultObject['status'] = true;
    resultObject['data'] = scheduledJobs;
    return resultObject;
  }

  export function reorderJobsInAsJobsGrid(
    droppedJob,
    dropSequence,
    droppedJobIndex,
    scheduledJobs
  ) {
    let scheduledJobsLength = scheduledJobs.length;
    let sourceJobSequence = droppedJob['sequenceNum'];
    let tempJob = angular.copy(droppedJob);
    if (sourceJobSequence === dropSequence) {
      return scheduledJobs;
    }
    if (sourceJobSequence > dropSequence) {
      for (let index = 0; index < scheduledJobsLength; index++) {
        let currentJob = scheduledJobs[index];
        let currentJobSequence = currentJob['sequenceNum'];
        if (currentJobSequence >= dropSequence) {
          if (droppedJobIndex >= index) {
            tempJob['sequenceNum'] = currentJobSequence;
            scheduledJobs[index] = tempJob;
            tempJob = currentJob;
            dropSequence = currentJobSequence;
          }
        }
      }
    }
    if (sourceJobSequence < dropSequence) {
      let maxLenght = scheduledJobsLength - 1;
      for (let index = maxLenght; index > -1; index--) {
        let currentJob = scheduledJobs[index];
        let currentJobSequence = currentJob['sequenceNum'];
        if (currentJobSequence <= dropSequence) {
          if (droppedJobIndex <= index) {
            tempJob['sequenceNum'] = currentJobSequence;
            scheduledJobs[index] = tempJob;
            tempJob = currentJob;
            dropSequence = currentJobSequence;
          }
        }
      }
    }
    return scheduledJobs;
  }

  export function getDispalyValuesWithData(columnData) {
    let elements = '';
    let childrenIdsArray = new Array();
    let keysArray = Object.keys(columnData);
    let keysArrayLength = keysArray.length;
    for (let index = 0; index < keysArrayLength; index++) {
      let key = keysArray[index];
      let children = columnData[key];
      children.forEach(child => {
        let dataObject = {};
        dataObject['jobId'] = child.id;
        dataObject['orderId'] = child.orderId;
        dataObject['customer_name'] = child.customerName;
        dataObject['isOnMachine'] = child.isOnMachine;
        if (typeof child.jobState !== 'undefined') {
          dataObject['remainingRunTime'] = DateNamespace.getRemainingRunTime(
            child.jobState.remainingRuntime
          );
          dataObject[
            'expectedCompletionDate'
          ] = DateNamespace.getExpectedCompletedDateTime(
            child.jobState.remainingRuntime
          );
          let totalFt = parseInt(child.totalFt);
          let completedFt = parseInt(child.jobState.completeFt);
          let completedPercentage = Math.round((completedFt / totalFt) * 100);
          dataObject['complete'] = completedPercentage;
        }
        if (elements === '') {
          elements = JSON.stringify(dataObject);
        } else {
          elements = elements + "`'`" + JSON.stringify(dataObject);
        }
      });
    }
    return elements;
  }

  export function getDisplayValuesOfFields(
    columnData: Map<string, Sch.PopulatedJob[]>
  ) {
    let elements = '';
    let objectKeys = Object.keys(columnData);
    objectKeys.forEach(element => {
      let childrenCount =
        typeof columnData[element] !== 'undefined'
          ? columnData[element].length
          : 1;
      let children: Sch.AvailableJobDetail[] = columnData[element];
      let childrenIdsArray = new Array();
      children.forEach(child => {
        childrenIdsArray.push(child.id);
      });
      if (elements === '') {
        elements = element + '`!`' + JSON.stringify(childrenIdsArray);
      } else {
        elements =
          elements + "`'`" + element + '`!`' + JSON.stringify(childrenIdsArray);
      }
    });
    return elements;
  }

  export function addJobsDataToMap(
    parentKey,
    map: Map<string, Sch.AvailableJobDetail[]>,
    key,
    fieldName,
    arrayOfObjects: Sch.AvailableJobDetail[],
    titlesOrder: string[]
  ) {
    if (key === '') key = 'NA';
    let updatedKey =
      typeof parentKey === 'undefined' ? key : key + '`!`' + parentKey;
    let titleIndex = titlesOrder.indexOf(fieldName);
    let childKey = titlesOrder[titleIndex + 1];
    let arrayOfJobs = new Array();
    let dataMap = new Map();
    if (arrayOfObjects.length > 1 && typeof childKey !== 'undefined') {
      let dataMapForSorting = new Map();
      arrayOfObjects.forEach((object, index) => {
        let fieldValue = object[childKey] === '' ? 'NA' : object[childKey];
        dataMap[fieldValue + '`~`' + object['id']] = object;
        let mapKey = isNaN(fieldValue) ? fieldValue : parseFloat(fieldValue);
        if (typeof dataMapForSorting[fieldValue] === 'undefined') {
          let items = new Array();
          items.push(fieldValue + '`~`' + object['id']);
          dataMapForSorting[mapKey] = items;
        } else {
          let existingItems = dataMapForSorting[mapKey];
          existingItems.push(fieldValue + '`~`' + object['id']);
          dataMapForSorting[mapKey] = existingItems;
        }
      });
      let arrayOfKeys = [];
      for (let index in dataMapForSorting) {
        let value =
          Number(index).toString() === 'NaN' ? index : parseFloat(index);
        arrayOfKeys.push(value);
      }
      let a,
        b,
        a1,
        b1,
        rx = /(\d+)|(\D+)/g,
        rd = /\d+/;
      let keysArray = arrayOfKeys.sort(function (as, bs) {
        a = String(as).toLowerCase().match(rx);
        b = String(bs).toLowerCase().match(rx);
        while (a.length && b.length) {
          a1 = a.shift();
          b1 = b.shift();
          if (rd.test(a1) || rd.test(b1)) {
            if (!rd.test(a1)) return 1;
            if (!rd.test(b1)) return -1;
            if (a1 !== b1) return a1 - b1;
          } else if (a1 !== b1) return a1 > b1 ? 1 : -1;
        }
        return a.length - b.length;
      });
      keysArray.forEach(key => {
        let values = dataMapForSorting[key];
        values.forEach(element => {
          arrayOfJobs.push(dataMap[element]);
        });
      });
    } else {
      arrayOfJobs = arrayOfObjects;
    }
    if (map[updatedKey] === null || typeof map[updatedKey] === 'undefined') {
      map[updatedKey] = arrayOfJobs;
    } else {
      let existingRecords = map[updatedKey];
      map[updatedKey] = existingRecords.concat(arrayOfJobs);
    }
    return map;
  }

  export class PrepareAvailableJobsGridData {
    titlesOrder: string[];
    columnTwoData: any;
    columnThreeData: any;
    columnFourData: any;
    columnFiveData: any;
    columnSixData: any;
    columnSevenData: any;
    columnEightData: any;
    columnNineData: any;
    columnTenData: any;
    columnEleventhData: any;

    constructor(titlesOrder: string[]) {
      this.titlesOrder = titlesOrder;
    }

    setTitleOrder(titlesOrder: string[]) {
      this.titlesOrder = titlesOrder;
    }

    getAvGridItemData = function (
      key,
      val: Sch.AvailableJobDetail[],
      filed,
      index
    ) {
      let resultArray = new Array();
      switch (index) {
        case 0:
          let children = new Array();
          val.forEach(job => {
            children.push(job.id);
          });
          return key + '`!`' + JSON.stringify(children);
        case 1:
          let levelTwoMap = new Map<string, Sch.AvailableJobDetail[]>();
          let arrayOfJobs = new Array<Sch.AvailableJobDetail>();
          let currentItem = null;
          let previousItemId = null;
          let secondFieldName = this.titlesOrder[1];
          val.forEach(job => {
            if (currentItem === null) currentItem = job;
            if (previousItemId === null) {
              previousItemId = job[secondFieldName];
              arrayOfJobs.push(job);
            } else if (previousItemId === job[secondFieldName]) {
              arrayOfJobs.push(job);
            } else {
              levelTwoMap = addJobsDataToMap(
                undefined,
                levelTwoMap,
                currentItem[secondFieldName],
                secondFieldName,
                arrayOfJobs,
                this.titlesOrder
              );
              currentItem = job;
              previousItemId = job[secondFieldName];
              arrayOfJobs = new Array();
              arrayOfJobs.push(job);
            }
          });
          if (currentItem !== null) {
            levelTwoMap = addJobsDataToMap(
              undefined,
              levelTwoMap,
              currentItem[secondFieldName],
              secondFieldName,
              arrayOfJobs,
              this.titlesOrder
            );
          }
          this.columnTwoData = this.dataSortingInMap(levelTwoMap);
          return getDisplayValuesOfFields(this.columnTwoData);
        case 2:
          let levelThreeMap = new Map();
          this.columnThreeData = this.prepareDataMap(
            this.columnTwoData,
            this.titlesOrder[2]
          );
          return getDisplayValuesOfFields(this.columnThreeData);
        case 3:
          let levelFourMap = new Map();
          this.columnFourData = this.prepareDataMap(
            this.columnThreeData,
            this.titlesOrder[3]
          );
          return getDisplayValuesOfFields(this.columnFourData);
        case 4:
          let levelFiveMap = new Map();
          this.columnFiveData = this.prepareDataMap(
            this.columnFourData,
            this.titlesOrder[4]
          );
          return getDisplayValuesOfFields(this.columnFiveData);
        case 5:
          let levelSixMap = new Map();
          this.columnSixData = this.prepareDataMap(
            this.columnFiveData,
            this.titlesOrder[5]
          );
          return getDisplayValuesOfFields(this.columnSixData);
        case 6:
          let levelSevenMap = new Map();
          this.columnSevenData = this.prepareDataMap(
            this.columnSixData,
            this.titlesOrder[6]
          );
          return getDisplayValuesOfFields(this.columnSevenData);
        case 7:
          let levelEightMap = new Map();
          this.columnEightData = this.prepareDataMap(
            this.columnSevenData,
            this.titlesOrder[7]
          );
          return getDisplayValuesOfFields(this.columnEightData);
        case 8:
          let levelNineMap = new Map();
          this.columnNineData = this.prepareDataMap(
            this.columnEightData,
            this.titlesOrder[8]
          );
          return getDisplayValuesOfFields(this.columnNineData);
        case 9:
          let levelTenMap = new Map();
          this.columnTenData = this.prepareDataMap(
            this.columnNineData,
            this.titlesOrder[9]
          );
          return getDisplayValuesOfFields(this.columnTenData);
        case 10:
          let levelEleventhMap = new Map();
          this.columnEleventhData = this.prepareDataMap(
            this.columnTenData,
            this.titlesOrder[10]
          );
          return getDisplayValuesOfFields(this.columnEleventhData);
      }
    };

    prepareDataMap(sourceData, fieldName) {
      let dataMap = new Map();
      let arrayOfJobs = new Array();
      let currentItem = null;
      let previousItemId = null;
      let previousKey = null;
      let currentKey = null;
      Object.keys(sourceData).forEach(key => {
        let keyArray = key.split('`!`');
        currentKey = key;
        if (previousKey === null) {
          previousKey = currentKey;
        }
        sourceData[key].forEach(job => {
          if (currentItem === null) {
            currentItem = job;
            currentKey = currentKey;
            previousKey = currentKey;
          }
          if (previousItemId === null) {
            previousItemId = job[fieldName];
            arrayOfJobs.push(job);
          } else if (
            previousItemId === job[fieldName] &&
            previousKey === currentKey
          ) {
            arrayOfJobs.push(job);
          } else {
            dataMap = addJobsDataToMap(
              previousKey,
              dataMap,
              currentItem[fieldName],
              fieldName,
              arrayOfJobs,
              this.titlesOrder
            );
            currentItem = job;
            previousKey = currentKey;
            previousItemId = job[fieldName];
            arrayOfJobs = new Array();
            arrayOfJobs.push(job);
          }
        });
      });
      if (currentItem !== null) {
        dataMap = addJobsDataToMap(
          currentKey,
          dataMap,
          currentItem[fieldName],
          fieldName,
          arrayOfJobs,
          this.titlesOrder
        );
      }
      return dataMap;
    }

    dataSortingInMap<TKey, TVal>(sourceMap: Map<TKey, TVal>): Map<TKey, TVal> {
      let keysArray = Object.keys(sourceMap).sort();
      let dataMap = new Map();
      keysArray.forEach(key => {
        dataMap[key] = sourceMap[key];
      });
      return dataMap;
    }
  }
}
