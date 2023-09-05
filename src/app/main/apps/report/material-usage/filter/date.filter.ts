import * as moment from 'moment';

export function materialDateFilter() {
  function timebefore(startDate, state) {
    const mm = moment(startDate);
    const day = mm.format('DD');
    const month = mm.format('MMM');
    const year = mm.format('YYYY');

    //todo: make this generic (not just for material)
    let newText = '';
    switch (state) {
      case 'month':
        {
          newText = `${month} ${year}`;
          break;
        }

      default:
        {
          newText = `${month} ${day}<span class='last-child'>${year}</span>`;
          break;
        }
    }


    return newText;
  }
  return timebefore;
}