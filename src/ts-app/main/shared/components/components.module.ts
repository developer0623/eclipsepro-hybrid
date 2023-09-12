import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout'
import { UIRouterModule } from "@uirouter/angular";
import {TooltipPosition, MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';
import { MachineDashboardMiniComponent } from './machine-dashboard-mini/machine-dashboard-mini.component';
import { HoleCountModeIconComponent } from './hole-count-mode-icon/hole-count-mode-icon.component';
import { LockoutIndicatorComponent } from './lockout-indicator/lockout-indicator.component';
import { RunStateIndicatorComponent } from './run-state-indicator/run-state-indicator.component';
import { SnapshotBarComponent } from './snapshot-bar/snapshot-bar.component';
import { DurationDisplayComponent } from './duration-display/duration-display.component';
import { NgxTranslateModule } from 'src/ts-app/translate/translate.module';
import { MetricLargeComponent } from './metric-large/metric-large.component';
import { HelpIconComponent } from './help-icon/help-icon.component';
import { SparklineComponent } from './sparkline/sparkline.component';
import { BulletChartComponent } from './bullet-chart/bullet-chart.component';
import { NvD3Component } from './nvd3/nvd3.component';
import { CustomToolTipComponent } from './custom-tooltip/custom-tooltip.component';
import { ShiftSelectComponent } from './shift-select/shift-select.component';
import { ShiftSummaryComponent } from './shift-summary/shift-summary.component';
import { ScheduleSummaryComponent } from './schedule-summary/schedule-summary.component';
import { ParetoComponent } from './pareto/pareto.component';



@NgModule({
  declarations: [
    MachineDashboardMiniComponent,
    HoleCountModeIconComponent,
    LockoutIndicatorComponent,
    RunStateIndicatorComponent,
    SnapshotBarComponent,
    DurationDisplayComponent,
    MetricLargeComponent,
    HelpIconComponent,
    SparklineComponent,
    BulletChartComponent,
    NvD3Component,
    CustomToolTipComponent,
    ShiftSelectComponent,
    ShiftSummaryComponent,
    ScheduleSummaryComponent,
    ParetoComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UIRouterModule,
    MatTooltipModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    PipesModule,
    DirectivesModule,
    NgxTranslateModule
  ],
  exports: [
    MachineDashboardMiniComponent,
    HoleCountModeIconComponent,
    LockoutIndicatorComponent,
    RunStateIndicatorComponent,
    SnapshotBarComponent,
    DurationDisplayComponent,
    MetricLargeComponent,
    HelpIconComponent,
    SparklineComponent,
    BulletChartComponent,
    NvD3Component,
    CustomToolTipComponent,
    ShiftSelectComponent,
    ShiftSummaryComponent,
    ScheduleSummaryComponent,
    ParetoComponent
  ]
})
export class ComponentsModule { }
