import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolTipRendererDirective } from './tool-tip-renderer.directive';
import { MatTabScrollToCenterDirective } from './scroll-to-center.directive';



@NgModule({
  declarations: [
    ToolTipRendererDirective,
    MatTabScrollToCenterDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToolTipRendererDirective,
    MatTabScrollToCenterDirective
  ]
})
export class DirectivesModule { }
