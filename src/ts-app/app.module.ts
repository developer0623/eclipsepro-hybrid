import { NgModule } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';

// PlotlyViaCDNModule.setPlotlyVersion('1.55.2'); // can be `latest` or any version number (i.e.: '1.40.0')
// PlotlyViaCDNModule.setPlotlyBundle('basic'); // optional: can be null (for full) or 'basic', 'cartesian', 'geo', 'gl3d', 'gl2d', 'mapbox' or 'finance'
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { UIRouterModule } from '@uirouter/angular';
import { eclipseProApp } from '../app/index.module';
import { PrefsModule } from './prefs/prefs.module';
import { DashboardsModule } from './main/dashboards/dashboards.module';

// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    FlexLayoutModule,
    UpgradeModule,
    UIRouterUpgradeModule,
    PrefsModule,
    DashboardsModule
    // AppRoutingModule,
  ],
  providers: [
    { provide: 'apiResolver', deps: ['$injector'], useFactory: ($injector) =>  $injector.get('apiResolver')},
    { provide: 'machineData', deps: ['$injector'], useFactory: ($injector) =>  $injector.get('machineData') },
    { provide: 'clientDataStore', deps: ['$injector'], useFactory: ($injector) =>  $injector.get('clientDataStore') },
  ],
  declarations: [],
  // bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [eclipseProApp.name], { strictDi: true });
  }
 }
