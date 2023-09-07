import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitsFormatPipe, UnitsValuePipe, UserDisplayUnitsPipe, TaskLenghValuePipe } from './units.pipe';
import { ObscureNumberStringPipe } from './obscure-number-string.pipe';
import { ShowInMiniPipe } from './show-in-mini.pipe';



@NgModule({
  declarations: [
    UnitsFormatPipe,
    UnitsValuePipe,
    UserDisplayUnitsPipe,
    TaskLenghValuePipe,
    ObscureNumberStringPipe,
    ShowInMiniPipe
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
    ShowInMiniPipe
  ]
})
export class PipesModule { }
