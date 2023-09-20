import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { UIRouterModule } from '@uirouter/angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { DashboardsComponent } from './dashboards/dashboards.component';
import { ComponentsModule } from '../shared/components/components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { PipesModule } from "../shared/pipes/pipes.module";
import { MachineDetailComponent } from './machine-detail/machine-detail.component';

const dashboardsState = {
  name: 'app.dashboards',
  url: '/dashboards/machines',
  views: {
    'content@app': {component: DashboardsComponent}
  }
  // component: DashboardsComponent,
  // Mark this state as requiring authentication.  See ../global/requiresAuth.hook.js.
  // data: { requiresAuth: true }
};

const machineState = {
  name: 'app.dashboards.machine',
  url: '/:id',
  views: {
    'content@app': {component: MachineDetailComponent}
  }
};

@NgModule({
    declarations: [
        DashboardsComponent,
        MachineDetailComponent
    ],
    imports: [
        CommonModule,
        MatTabsModule,
        ComponentsModule,
        DirectivesModule,
        FlexLayoutModule,
        UIRouterModule.forChild({ states: [dashboardsState, machineState] }),
        CdkMenuTrigger, CdkMenu, CdkMenuItem,
        MatIconModule,
        MatButtonModule,
        PipesModule
    ]
})
export class DashboardsModule { }
