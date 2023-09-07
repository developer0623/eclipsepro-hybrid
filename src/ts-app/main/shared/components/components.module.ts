import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import { MachineDashboardMiniComponent } from './machine-dashboard-mini/machine-dashboard-mini.component';
import { HoleCountModeIconComponent } from './hole-count-mode-icon/hole-count-mode-icon.component';
import { LockoutIndicatorComponent } from './lockout-indicator/lockout-indicator.component';
import { RunStateIndicatorComponent } from './run-state-indicator/run-state-indicator.component';
import { SnapshotBarComponent } from './snapshot-bar/snapshot-bar.component';
import { DurationDisplayComponent } from './duration-display/duration-display.component';



@NgModule({
  declarations: [
    MachineDashboardMiniComponent,
    HoleCountModeIconComponent,
    LockoutIndicatorComponent,
    RunStateIndicatorComponent,
    SnapshotBarComponent,
    DurationDisplayComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ComponentsModule { }
