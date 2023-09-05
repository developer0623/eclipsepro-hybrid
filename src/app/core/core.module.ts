import { module } from 'angular'
import 'angular-animate';
import 'angular-aria';
import 'angular-cookies';
import 'angular-messages';
import 'angular-resource';
import 'angular-sanitize';
import 'angular-material';
// import 'angular-datatables';
// import 'datatables.net';
import 'angular-nvd3';
import 'angular-translate';
import 'angular-translate-loader-partial';
import 'angular-translate-loader-static-files';
import 'angular-translate-loader-url';
import 'angular-translate-storage-local';
import 'angular-translate-storage-cookie';
import 'angular-timer';
import 'angular-ui-router'
import 'textangular';
// import 'ng-sortable';
// import 'sortablejs'
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui-touch-punch';
import 'angular-ui-sortable';
import 'ng-focus-if';
import 'angular-screenfull';
import 'angular-xeditable';
import 'angular-material-data-table'
import appCoreDirectives from './directives'
import appCoreServices from './services';
import appCoreFilters from './filters';
import { config } from './core.config';
import { runBlock } from './core.run';
import { eclipseProConfigProvider } from './config/eclipse-pro-config.provider';
import { eclipseProHelperService } from './services/eclipse-pro-helper/eclipse-pro-helper.service';
import { eclipseProGeneratorService } from './theming/eclipse-pro-generator.factory';
import { eclipseProThemes } from './theming/eclipse-pro-themes.constant';
import { themeConfig } from './theming/eclipse-pro-theming.config';
import { eclipseProPalettes } from './theming/eclipse-pro-palettes.constant';
import { eclipseProThemingProvider } from './theming/eclipse-pro-theming.provider';
import angularDc from '../lib/angular-dc/angular-dc';
import { raygunService } from './raygun.service';
import 'angular1-async-filter';

const coreModule = module('app.core', [
    'ngMaterial',
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    //'ngTouch',
    // 'datatables',
    'nvd3',
    'pascalprecht.translate',
    'timer',
    'ui.router',
    'textAngular',
   //  // 'ng-sortable',
    'ui.sortable',
    'focus-if',
    'angularScreenfull',
    // 'angularDc',
    'xeditable',
    'md.data.table',
    appCoreDirectives,
    appCoreServices,
    appCoreFilters,
    angularDc,
    'asyncFilter'
])
.constant('eclipseProPalettes', [eclipseProPalettes])
    .run(['eclipseProGenerator', 'eclipseProConfig', 'eclipseProHelper', 'featureFlagService', 'clientDataStore',
    'clientDataDispatcher', 'subscriptionService', 'apiResolver', 'authService', '$location', '$translate',
    '$mdToast', '$http', 'editableOptions',  '$rootScope','$transitions', runBlock])
    .config(['$ariaProvider','$logProvider', 'msScrollConfigProvider', '$translateProvider', '$provide', 'eclipseProConfigProvider', config])
   .factory('errors', [raygunService])
   .provider('eclipseProConfig', [eclipseProConfigProvider])
   .factory('eclipseProHelper', ['$q', eclipseProHelperService])
   .factory('eclipseProGenerator', ['eclipseProTheming', '$cookies', eclipseProGeneratorService])
   .constant('eclipseProThemes', [eclipseProThemes])
   .config(['$mdThemingProvider','eclipseProPalettes', 'eclipseProThemes', 'eclipseProThemingProvider', themeConfig])

   .provider('eclipseProTheming', [eclipseProThemingProvider])
   .name;

export default coreModule;
