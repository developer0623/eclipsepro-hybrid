import { Pipe, PipeTransform } from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(lastRunStateChange): unknown {
    let m = moment(lastRunStateChange);
    let ago = m.fromNow(true);
    return ago;
  }

}
