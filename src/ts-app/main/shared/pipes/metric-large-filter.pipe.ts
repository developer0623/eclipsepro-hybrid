import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metricLargeFilter'
})
export class MetricLargeFilterPipe implements PipeTransform {

  transform(values: any[], defs: any[],  isLarge: boolean): unknown {
    if (!values || values.length === 0) return [];
    return values.filter(val => !!defs[val.metricId] && val.showInLarge === isLarge);
  }

}
