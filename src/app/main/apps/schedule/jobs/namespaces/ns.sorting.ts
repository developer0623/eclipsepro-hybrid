import { Sch } from '../../../../../core/services/jobs.service.types';

export namespace Sorting {
  export class SortingJobs {
    sortingJobsBySequenceNumber(jobsData: Sch.MachineJobsModel) {
      let jobs = [] as Sch.ScheduledJobDetail[];
      if (typeof jobsData !== 'undefined') {
        let assignedJobs = jobsData.ScheduledJobs;
        if (typeof assignedJobs === 'undefined') {
          return jobs;
        }
        let mapAssignedJobsWithSequenceNumber = new Map<
          number,
          Sch.ScheduledJobDetail
        >();
        let mapKeys: number[] = [];
        let lastSequenceNum = 0;
        let assignedJobsLenght = assignedJobs.length;
        for (let index = 0; index < assignedJobsLenght; index++) {
          let currentJob = assignedJobs[index];
          if (typeof currentJob.sequenceNum === 'undefined') {
            currentJob['sequenceNum'] = lastSequenceNum += 1;
          }
          lastSequenceNum = currentJob.sequenceNum;
          mapKeys.push(lastSequenceNum);
          mapAssignedJobsWithSequenceNumber[
            currentJob.sequenceNum
          ] = currentJob;
        }
        let keys = this.sortMapKeys(mapKeys);
        jobs = keys.map(function (key) {
          return mapAssignedJobsWithSequenceNumber[key];
        }, mapAssignedJobsWithSequenceNumber);
      }
      return jobs;
    }

    sortMapKeys(mapKeys: number[]) {
      let a,
        b,
        a1,
        b1,
        rx = /(\d+)|(\D+)/g,
        rd = /\d+/;
      mapKeys.sort(function (as, bs) {
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
      return mapKeys;
    }
  }
}
