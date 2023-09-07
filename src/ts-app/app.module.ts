import { NgModule } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { UIRouterModule } from '@uirouter/angular';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
    MatIconModule,
    HttpClientModule,
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
  constructor(private upgrade: UpgradeModule){ }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [eclipseProApp.name], { strictDi: true });
  }
 }
