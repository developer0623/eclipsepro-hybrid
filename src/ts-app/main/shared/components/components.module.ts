import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout'
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { PipesModule } from '../pipes/pipes.module';
import { MachineDashboardMiniComponent } from './machine-dashboard-mini/machine-dashboard-mini.component';
import { HoleCountModeIconComponent } from './hole-count-mode-icon/hole-count-mode-icon.component';
import { LockoutIndicatorComponent } from './lockout-indicator/lockout-indicator.component';
import { RunStateIndicatorComponent } from './run-state-indicator/run-state-indicator.component';
import { SnapshotBarComponent } from './snapshot-bar/snapshot-bar.component';
import { DurationDisplayComponent } from './duration-display/duration-display.component';
import { NgxTranslateModule } from 'src/ts-app/translate/translate.module';



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
    FlexLayoutModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    PipesModule,
    NgxTranslateModule
  ],
  exports: [
    MachineDashboardMiniComponent,
    HoleCountModeIconComponent,
    LockoutIndicatorComponent,
    RunStateIndicatorComponent,
    SnapshotBarComponent,
    DurationDisplayComponent
  ]
})
export class ComponentsModule { }
