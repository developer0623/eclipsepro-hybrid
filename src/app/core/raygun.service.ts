import rg4js from 'raygun4js';

export function raygunService() {
   let service = { reportError: reportError };

   function reportError(error) {
      console.log('Look, an ERROR', error);
      rg4js('send', error);
   }

   function config() {
      console.log('raygun config');
      let disable = window.location.port === '3000' || window.location.hostname === 'localhost.amscontrols.com';
      if (disable){
         console.warn('Raygun disabled because you look like a dev.');
         return;
      }
      rg4js('apiKey', 'OuAKhekjbLYtxIohG1uOUA');
      rg4js('enableCrashReporting', !disable);
      rg4js('enablePulse', !disable);

      // rg4js('onBeforeSendRUM', function (payload) {
      //    console.log('rum', payload);
      //    return payload;
      // });
   }

   config();

   return service;
}
