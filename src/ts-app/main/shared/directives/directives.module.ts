import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolTipRendererDirective } from './tool-tip-renderer.directive';



@NgModule({
  declarations: [
    ToolTipRendererDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToolTipRendererDirective
  ]
})
export class DirectivesModule { }
