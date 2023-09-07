import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIRouterModule } from '@uirouter/angular';
import { DashboardsComponent } from './dashboards/dashboards.component';
import { ComponentsModule } from '../shared/components/components.module';

const dashboardsState = {
  name: 'app.test',
  url: '/test',
  views: {
    'content@app': {component: DashboardsComponent}
  }
  // component: DashboardsComponent,
  // Mark this state as requiring authentication.  See ../global/requiresAuth.hook.js.
  // data: { requiresAuth: true }
};

@NgModule({
  declarations: [
    DashboardsComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    UIRouterModule.forChild({ states: [dashboardsState] })
  ]
})
export class DashboardsModule { }
