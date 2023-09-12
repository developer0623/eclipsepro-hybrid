import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showInMini'
})
export class ShowInMiniPipe implements PipeTransform {

  transform(values: any[], isMini: boolean): unknown {
    if (!values || values.length === 0) return [];
    return values.filter(val => val.showInMini === isMini);
  }

}
