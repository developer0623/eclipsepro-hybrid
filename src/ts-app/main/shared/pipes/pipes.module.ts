import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitsFormatPipe, UnitsValuePipe, UserDisplayUnitsPipe, TaskLenghValuePipe } from './units.pipe';
import { ObscureNumberStringPipe } from './obscure-number-string.pipe';
import { ShowInMiniPipe } from './show-in-mini.pipe';
import { OrderByPipe } from './order-by.pipe';
import { ShowInLargePipe } from './show-in-large.pipe';
import { MetricLargeFilterPipe } from './metric-large-filter.pipe';
import { AgePipe, DatesPipe, AmsTimePipe, AmsDateTimePipe, AmsDateTimeSecPipe, AmsTimeAgoPipe, TimeSpanPipe} from './dates.pipe';
import { TimeAgoPipe } from './basic.pipe';



@NgModule({
  declarations: [
    UnitsFormatPipe,
    UnitsValuePipe,
    UserDisplayUnitsPipe,
    TaskLenghValuePipe,
    ObscureNumberStringPipe,
    ShowInMiniPipe,
    OrderByPipe,
    ShowInLargePipe,
    MetricLargeFilterPipe,
    DatesPipe,
    AgePipe,
    AmsTimePipe,
    AmsDateTimePipe,
    AmsDateTimeSecPipe,
    AmsTimeAgoPipe,
    TimeSpanPipe,
    TimeAgoPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UnitsFormatPipe,
    UnitsValuePipe,
    UserDisplayUnitsPipe,
    TaskLenghValuePipe,
    ObscureNumberStringPipe,
    ShowInMiniPipe,
    OrderByPipe,
    ShowInLargePipe,
    MetricLargeFilterPipe,
    DatesPipe,
    AgePipe,
    AmsTimePipe,
    AmsDateTimePipe,
    AmsDateTimeSecPipe,
    AmsTimeAgoPipe,
    TimeSpanPipe,
    TimeAgoPipe
  ]
})
export class PipesModule { }
