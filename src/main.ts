import * as angular from 'angular';
(window as any).angular = angular;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { UIRouter, UrlService } from '@uirouter/core';
import { visualizer } from '@uirouter/visualizer';

import { AppModule } from './ts-app/app.module';

// app.config([ '$urlServiceProvider', ($urlService: UrlService) => $urlService.deferIntercept() ]);
platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
  // Intialize the Angular Module
  // get() the UIRouter instance from DI to initialize the router
  // const urlService: UrlService = platformRef.injector.get(UIRouter).urlService;

  // // Instruct UIRouter to listen to URL changes
  // urlService.listen();
  // urlService.sync();
}).catch(err => console.error(err));

// app.run(['$uiRouter', ($uiRouter) => visualizer($uiRouter) ]);
