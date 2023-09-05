import { Sch } from '../../../../../core/services/jobs.service.types';
export namespace DropLocationOperations {
  export function showDividerLine(
    elem: HTMLDivElement,
    divider: HTMLDivElement,
    position: string,
    topPosition: number,
    isCurrentDragItem: boolean
  ) {
    let currentNode = elem;
    let children = currentNode.children;
    if (children.length <= 1) {
      return undefined;
    }
    let contentNode = undefined;
    let childrenCount = children.length;
    for (let index = 0; index < childrenCount; index++) {
      let elem = children[index];
      if (elem.nodeName === 'P') {
        contentNode = elem;
        break;
      }
    }
    if (typeof contentNode === 'undefined') return;
    let attributes = contentNode.attributes;
    let nodeValue = attributes.getNamedItem('value').nodeValue;
    let jobDetails = JSON.parse(nodeValue).jobId;
    if (typeof divider !== 'undefined') {
      let dividerClassName = divider.className;
      divider.className = dividerClassName.replace(' hover-divider-color', '');
      divider.style.position = 'initial';
      divider.style.visibility = 'hidden';
      divider = children[0] as HTMLDivElement;
    }
    let dividerContainer = undefined;
    for (let index = 0; index < childrenCount; index++) {
      let elem = children[index];
      if (
        elem.nodeName === 'DIV' &&
        elem.className.indexOf('droplocation-container') > -1
      ) {
        dividerContainer = elem;
        break;
      }
    }
    if (dividerContainer.children.length > 0) {
      divider = dividerContainer.children[0];
      if (!isCurrentDragItem) {
        divider.className += ' hover-divider-color';
        divider.style.position = 'absolute';
        divider.style.setProperty('top', topPosition + 'px');
        divider.style.visibility = 'visible';
        divider.style.setProperty('z-index', '8');
      }
    }
    return divider;
  }

  export function hideDividerLine(elem, divider) {
    if (typeof divider !== 'undefined') {
      let dividerClassName = divider.className;
      divider.className = dividerClassName.replace(' hover-divider-color', '');
    }
    return divider;
  }

  export function getDroplocationSequenceNumber(
    divider: HTMLDivElement,
    jobsArray: Sch.ScheduledJobDetail[],
    isAvailableJob: boolean,
    position: string,
    currentJobSeqNum: number
  ): number | undefined {
    if (typeof divider !== 'undefined') {
      let parent = divider.parentNode;
      let superParent = parent.parentNode as HTMLElement;
      let siblings = superParent.children;
      let siblingsCount = siblings.length;
      let dataElement = undefined;
      for (let index = 0; index < siblingsCount; index++) {
        let elem = siblings[index];
        if (elem.nodeName === 'P') {
          dataElement = elem;
          break;
        }
      }
      if (typeof dataElement === 'undefined') return;
      let attributes = dataElement.attributes;
      let valueAttribute = attributes.getNamedItem('value');
      let jobId = JSON.parse(valueAttribute.value).jobId;
      if (!jobId) {
        jobId = JSON.parse(valueAttribute.value);
        if (position === 'top') {
          jobId = jobId[0];
        } else {
          jobId = jobId[jobId.length - 1];
        }
      }
      let jobsArrayLength = jobsArray.length;
      if (isAvailableJob) {
        for (let index = 0; index < jobsArrayLength; index++) {
          let currentJob = jobsArray[index];
          if (currentJob.id === jobId) {
            if (position === 'top') {
              return currentJob.sequenceNum;
            } else {
              return currentJob.sequenceNum + 1;
            }
          }
        }
      } else {
        for (let index = 0; index < jobsArrayLength; index++) {
          let currentJob = jobsArray[index];
          if (currentJob.id === jobId) {
            if (currentJob.sequenceNum < currentJobSeqNum) {
              if (position === 'top') {
                return currentJob.sequenceNum;
              } else {
                return currentJob.sequenceNum + 1;
              }
            } else {
              if (position === 'top') {
                return currentJob.sequenceNum - 1;
              } else {
                return currentJob.sequenceNum;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  export function showCustomGhostImage(
    ev,
    isAvailableJob,
    machineId,
    availJobsTitles,
    jobsData
  ) {
    let targetElement = ev.target;
    let attributes = targetElement.attributes;
    let valueAttribute = attributes.getNamedItem('value');
    if (typeof valueAttribute === 'undefined' || valueAttribute === null) {
      attributes = targetElement.parentNode.attributes;
      valueAttribute = targetElement.parentNode.attributes.getNamedItem(
        'value'
      );
      if (typeof valueAttribute === 'undefined' || valueAttribute === null) {
        valueAttribute = targetElement.parentNode.parentNode.attributes.getNamedItem(
          'value'
        );
        attributes = targetElement.parentNode.parentNode.attributes;
        if (typeof valueAttribute === 'undefined' || valueAttribute === null) {
          return;
        }
      }
    }
    let value = valueAttribute.value;
    let data = '';
    let jobsIds = [];
    if (isAvailableJob) {
      if (typeof valueAttribute !== 'undefined' && typeof value !== 'undefined') {
        jobsIds = JSON.parse(value);
      }
    } else {
      let parsedValue = JSON.parse(value);
      let jobIdsArray = [];
      if (!Array.isArray(parsedValue)) {
        jobIdsArray.push(parsedValue['jobId']);
      } else {
        jobIdsArray = parsedValue;
      }
      jobsIds = jobIdsArray;
    }
    let elementId = 'dragContent' + machineId;
    let ele = document.getElementById(elementId);
    ele.style.width = '650px';
    if (jobsIds.length === 0) return;
    if (jobsIds.length === 1) {
      let titlesLength = availJobsTitles.length;
      ele.style.display = 'inline';
      let currentWidth = 650;
      let elementWidth = 107.9;
      let newlyAddedElementsCount = 0;
      let totalWidth = currentWidth;
      if (titlesLength > 6) {
        newlyAddedElementsCount = titlesLength - 6;
        let extraWidth = newlyAddedElementsCount * elementWidth;
        totalWidth = currentWidth + extraWidth;
      }
      if (titlesLength < 6) {
        newlyAddedElementsCount = 6 - titlesLength;
        let extraWidth = newlyAddedElementsCount * elementWidth;
        totalWidth = currentWidth - extraWidth;
      }
      if (
        new String(currentWidth).valueOf() !== new String(totalWidth).valueOf()
      ) {
        ele.style.width = totalWidth + 'px';
      }
      data += '<ul style="list-style-type: none; margin: 0px; padding: 0px;">';
      (isAvailableJob
        ? jobsData.AvailableJobs
        : jobsData.ScheduledJobs
      ).forEach(job => {
        if (job.id === jobsIds[0]) {
          availJobsTitles.forEach(titleObject => {
            let fieldValue =
              job[titleObject.fieldName] === ''
                ? 'NA'
                : job[titleObject.fieldName];
            data +=
              '<li class="block-content text-center margin-one" style="float: left; width: 107.9px; margin-right: 0px; background: ' +
              getBackgroundColor(titleObject.fieldName) +
              ';"><span class="span-content">' +
              fieldValue +
              '</span></li>';
          });
        }
      });
      data += '</ul>';
    } else {
      let arrayOfTitles = availJobsTitles.slice(0, 2);
      let arrayOfJobs = new Array();
      (isAvailableJob
        ? jobsData.AvailableJobs
        : jobsData.ScheduledJobs
      ).forEach(job => {
        if (jobsIds.indexOf(job.id) !== -1) {
          arrayOfJobs.push(job);
        }
      });
      let resultantObject = {};
      let firstFieldName = arrayOfTitles[0].fieldName;
      let secondFieldName =
        typeof arrayOfTitles[1] === 'undefined'
          ? undefined
          : arrayOfTitles[1].fieldName;
      arrayOfJobs.forEach(job => {
        let firstFieldValues = new Array();
        let secondFieldValues = new Array();
        if (
          typeof resultantObject[firstFieldName] !== 'undefined' &&
          resultantObject[firstFieldName].length > 0
        ) {
          firstFieldValues = resultantObject[firstFieldName];
        }
        firstFieldValues.forEach(value => {
          if (firstFieldValues.indexOf(job[firstFieldName]) === -1) {
            firstFieldValues.push(job[firstFieldName]);
          }
        });
        if (firstFieldValues.length === 0)
          firstFieldValues.push(job[firstFieldName]);
        resultantObject[firstFieldName] = firstFieldValues;

        if (typeof secondFieldName !== 'undefined') {
          if (
            typeof resultantObject[secondFieldName] !== 'undefined' &&
            resultantObject[secondFieldName].length > 0
          ) {
            secondFieldValues = resultantObject[secondFieldName];
          }
          secondFieldValues.forEach(value => {
            if (secondFieldValues.indexOf(job[secondFieldName]) === -1) {
              secondFieldValues.push(job[secondFieldName]);
            }
          });
          if (secondFieldValues.length === 0)
            secondFieldValues.push(job[secondFieldName]);
          resultantObject[secondFieldName] = secondFieldValues;
        }
      });

      let firstFieldData =
        resultantObject[firstFieldName].length === 1
          ? resultantObject[firstFieldName][0]
          : resultantObject[firstFieldName].length + ' ' + firstFieldName;
      let secondFieldData =
        typeof secondFieldName === 'undefined'
          ? undefined
          : resultantObject[secondFieldName].length === 1
            ? resultantObject[secondFieldName][0]
            : resultantObject[secondFieldName].length + ' ' + secondFieldName;
      let jobsCount = arrayOfJobs.length + ' ' + ' Jobs';

      data += '<ul style="list-style-type: none; margin: 0px; padding: 0px;">';
      data +=
        '<li class="block-content text-center margin-one ' +
        getColorClass(firstFieldName) +
        '" style="float: left; width: 16%; margin-left: 0px;"><span class="span-content">' +
        firstFieldData +
        '</span></li>';
      if (typeof secondFieldData !== 'undefined')
        data +=
          '<li class="block-content text-center margin-one ' +
          getColorClass(secondFieldName) +
          '" style="float: left; width: 16%;"><span class="span-content">' +
          secondFieldData +
          '</span></li>';
      data +=
        '<li class="block-content text-center color-green-dark margin-one" style="float: left; width: ' +
        (typeof secondFieldData === 'undefined' ? '83.4%;' : '67.4%;') +
        ' margin-right: 0px;"><span class="span-content">' +
        jobsCount +
        '</span></li>';
      data += '</ul>';
    }
    ele.innerHTML = '';
    ele.innerHTML = data;
    ele.style.display = 'inline';
    ele.style.top = ev.clientY - 220 + 'px';
    ele.style.left = ev.clientX - 250 + 'px';
    ele.style.zIndex = '100';
    ele.style.position = 'absolute';
    let wrapperID = 'wrapper' + machineId;
    let wrapper = document.getElementById(wrapperID);
    wrapper.style.zIndex = '100';
  }

  export function updateCustomGhostImageLocation(
    ev,
    isAvailableJob,
    machineId,
    availJobsTitles,
    jobsData
  ) {
    let elementId = 'dragContent' + machineId;
    let ele = document.getElementById(elementId);
    ele.style.top = ev.clientY - 220 + 'px';
    ele.style.left = ev.clientX - 250 + 'px';
  }

  export function getBackgroundColor(fieldName: any) {
    switch (fieldName) {
      case 'toolingId':
        return '#F0BE34';
      case 'coilTypeId':
        return '#F9A94B';
      default:
        return '#A3BC41';
    }
  }

  export function getColorClass(fieldName) {
    switch (fieldName) {
      case 'toolingId':
        return 'color-brown-dark';
      case 'coilTypeId':
        return 'color-orange-dark';
      default:
        return 'color-green-dark';
    }
  }

  export function dragJobs(ev, isAvailableJob) {
    let targetElement = ev.target;
    let attributes = targetElement.attributes;
    let valueElement = attributes.getNamedItem('value');
    if (typeof valueElement === 'undefined' || valueElement === null) {
      attributes = targetElement.parentNode.attributes;
      valueElement = targetElement.parentNode.attributes.getNamedItem('value');
      if (typeof valueElement === 'undefined' || valueElement === null) {
        valueElement = targetElement.parentNode.parentNode.attributes.getNamedItem(
          'value'
        );
        attributes = targetElement.parentNode.parentNode.attributes;
        if (typeof valueElement === 'undefined' || valueElement === null) {
          return;
        }
      }
    }
    let jobIdsDetails = valueElement.value;
    let jobIds = '';
    if (
      typeof attributes === 'undefined' ||
      typeof valueElement === 'undefined'
    ) {
      return;
    }
    if (isAvailableJob) {
      ev.dataTransfer.setData('text', jobIdsDetails);
      jobIds = jobIdsDetails;
    } else {
      let parsedValue = JSON.parse(jobIdsDetails);
      let jobIdsArray = [];
      if (!Array.isArray(parsedValue)) {
        jobIdsArray.push(parsedValue['jobId']);
      } else {
        jobIdsArray = parsedValue;
      }
      jobIds = JSON.stringify(jobIdsArray);
      ev.dataTransfer.setData('text', jobIds);
    }
    ev.dataTransfer.setData('isAvailableJob', isAvailableJob);
    let image = document.createElement('img');
    image.src =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    ev.dataTransfer.setDragImage(image, 0, 0);
    return jobIds;
  }
}
