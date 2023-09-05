import angular from 'angular';
import { AmsMdTab } from './tabDirective';
import { AmsMdTabItem } from './tabItemDirective';
import { AmsMdTabLabel } from './tabLabelDirective';
import { AmsMdTabsController } from './tabsController';
import { AmsMdTabScroll } from './tabScroll';
import { AmsMdTabsPaginationService } from './tabsPaginationService';
import { AmsMdTabs } from './tabsDirective';
import { AmsMdTabsDummyWrapper } from './tabsDummyWrapperDirective';
import { AmsMdTabsTemplate } from './tabsTemplateDirective';
export default angular.module('ams.tabs', [])
  .directive('amsMdTabs', AmsMdTabs)
  .directive('amsMdTab', AmsMdTab)
  .directive('amsMdTabItem', AmsMdTabItem)
  .directive('amsMdTabLabel', AmsMdTabLabel)
  .controller('AmsMdTabsController', AmsMdTabsController)
  .directive('amsMdTabScroll', AmsMdTabScroll)
  .directive('amsMdTabsDummyWrapper', AmsMdTabsDummyWrapper)
  .directive('amsMdTabsTemplate', AmsMdTabsTemplate)
  .service('AmsMdTabsPaginationService', AmsMdTabsPaginationService)
  .name;
