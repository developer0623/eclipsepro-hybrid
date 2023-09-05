import { module } from 'angular';
import msScrollDirective from './ms-scroll/ms-scroll.directive';
import appCoreNav from './ms-navigation/ms-navigation.directive';
import appCoreAccordian from './accordion/accordion.directive';
import appMsCard from './ms-card/ms-card.directive';
import appCoreMsRandomClass from './ms-random-class/ms-random-class.directive';
import coreMsResponsiveTable from './ms-responsive-table/ms-responsive-table.directive';
import coreSideNavHelper from './ms-sidenav-helper/ms-sidenav-helper.directive';
import coreSplashScreen from './ms-splash-screen/ms-splash-screen.directive';
import coreTimeLine from './ms-timeline/ms-timeline';
import coreWidget from './ms-widget/ms-widget.directive';
import { currentTimeDirective } from './current-time.directive';
import { eatClickIf } from './eat-click-if.directive';
import { featureFlagDirective } from './feature-flag.directive';
import { hljsDirective } from './highlight.directive';
import { ifClaimDirective } from './if-claim.directive';
import { ifNotClaimDirective } from './if-not-claim.directive';
import { ifNotRoleDirective } from './if-not-role.directive';
import { ifRoleDirective } from './if-role.directive';
import msTooltipDirective from './ms-tooltip/ms-tooltip.directive';
import btfMarkdown from './markdown.directive'

export default module('app.core.directives', [
    appCoreNav,
    msScrollDirective,
    appCoreAccordian,
    appMsCard,
    appCoreMsRandomClass,
    coreMsResponsiveTable,
    coreSideNavHelper,
    coreSplashScreen,
    coreTimeLine,
    coreWidget,
    msTooltipDirective,
    btfMarkdown
])
    .directive('currentTime', ['$interval', 'systemInfoService', currentTimeDirective])
    .directive('eatClickIf', ['$parse', '$rootScope', eatClickIf])
    .directive('featureFlag', ['featureFlagService', '$interpolate', featureFlagDirective])
    .directive('hljs', [hljsDirective])
    .directive('ifClaim', ['clientDataStore', '$interpolate', ifClaimDirective])
    .directive('ifNotClaim', ['clientDataStore', '$interpolate', ifNotClaimDirective])
    .directive('ifNotRole', ['clientDataStore', '$interpolate', ifNotRoleDirective])
    .directive('ifRole', ['clientDataStore', '$interpolate', ifRoleDirective])
    .name;
