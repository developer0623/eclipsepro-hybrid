import * as angular from "angular";
import Rx from 'rx';
import { IApiResolverService } from "../../reference";

performanceDataService.$inject = ['apiResolver']
export function performanceDataService(apiResolver: IApiResolverService) {
  return new PerformanceDataService(apiResolver);
};

export class PerformanceDataService {
  public data: Array<any>;
  public status: Array<boolean> = [];
  public previousIndex: number;

  constructor(private apiResolver: IApiResolverService) { }

  refreshData() {
    // This really shouldn't be a (long lived) service. But since it is,
    // this method is easier than the proper refactoring.
    Rx.Observable.fromPromise<Array<any>>(
      this.apiResolver.resolve("performance.data@get")
    ).subscribe((data) => {
      this.data = data;
      this.status = new Array(data.length).fill(false);
    });
  }

  changeStatus(index: number) {
    if (index === this.previousIndex) {
      this.status[index] = false;
      this.previousIndex = null;
    } else if (index !== this.previousIndex && this.previousIndex !== null) {
      this.status[index] = true;
      this.status[this.previousIndex] = false;
      this.previousIndex = index;
    } else {
      this.status[index] = true;

      this.previousIndex = index;
    }
  }

  getStatus(index: number) {
    return this.status[index];
  }

  getCount(index: number) {
    let count = { unChecked: 0, total: this.data[index].toolings.length };
    this.data[index].toolings.map((tool) => {
      if (!tool.overrideMachine) {
        count.unChecked++;
      }
    });
    return count;
  }

  getParent(index: number) {
    return this.data[index].default;
  }

  updateValue(data: { machineNumber: number, toolingId: number, field: string, value: string | boolean | number }) {
    // todo: limit roles: [`tooling-editor`, `administrator`]
    
    this.apiResolver.resolve("performance.update@post", data)
      .then((result) => {
        console.log('result', result);
      });
  }
}
