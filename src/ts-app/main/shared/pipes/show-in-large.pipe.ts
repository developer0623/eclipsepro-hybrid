import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showInLarge'
})
export class ShowInLargePipe implements PipeTransform {

  transform(values: any[], flag: boolean): unknown {
    if (!values || values.length === 0) return [];
    return values.filter(val => val.showInLarge === flag);
  }

}
