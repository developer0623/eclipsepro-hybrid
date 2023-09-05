import angular from 'angular';
export default angular
   .module('app.core.directives.accordian', [])
   .controller('AccordionController', AccordionController)
   .directive('accordion', [accordionDirective as any])
   .directive('accordionToggle', [accordionToggleDirective as any])
   .directive('accordionToggleIn', [accordionToggleInDirective as any])
   .directive('accordionHeader', [accordionHeaderDirective as any])
   .directive('accordionContent', [accordionContentDirective as any])
   .name;


/** @ngInject */
AccordionController.$inject = ['$scope', '$element']
function AccordionController($scope: angular.IScope, $element: angular.IRootElementService) {
   let vm = this;

   // Methods
   vm.toggleAccordion = toggleAccordion;

   //////////
   function toggleAccordion() {
      // Toggle class
      $element.toggleClass('accordion-closed');
   }
}

/** @ngInject */
function accordionDirective() {
   return {
      restrict: 'E',
      controller: 'AccordionController',
      transclude: true,
      replace: true,
      template: `<div layout="column" class="accordion" ng-class="!isOpen && 'accordion-closed'" flex ng-transclude></div>`,
      scope: {
         isOpen: '=',
      },
      compile: function (tElement) {
         return function postLink(scope, iElement, iAttrs, AccordionCtrl) {
            if (!scope.isOpen) {
               iElement.addClass('accordion-closed');
            }
         };
      },
   };
}

/** @ngInject */
function accordionToggleDirective() {
   return {
      restrict: 'E',
      require: '^accordion',
      transclude: true,
      replace: true,
      scope: {
         label: '@',
      },
      template: `<div layout="row" layout-align="space-between center">
                       <div class="accordion-toggle-button" layout="row" layout-align="space-between center" ng-click="toggleAccordion()" flex>
                          <div>{{label}}</div>
                          <md-button class="md-icon-button accordian-closed-icon" aria-label="Accordion Toggle">
                             <md-icon md-font-icon="mdi-chevron-right" class="mdi s20 black-fg"></md-icon>
                          </md-button>
                          <md-button class="md-icon-button accordian-open-icon" aria-label="Accordion Toggle">
                             <md-icon md-font-icon="mdi-chevron-down" class="mdi s20 black-fg"></md-icon>
                          </md-button>

                       </div>
                       <div ng-transclude></div>
                    </div>`,
      compile: function (tElement) {
         tElement.addClass('accordion-toggle');

         return function postLink(scope, iElement, iAttrs, AccordionCtrl) {
            scope.toggleAccordion = AccordionCtrl.toggleAccordion;
         };
      },
   };
}

/** @ngInject */
function accordionToggleInDirective() {
   return {
      restrict: 'E',
      require: '^accordion',
      transclude: true,
      replace: true,
      scope: {
         label: '@',
      },
      template: `<div layout="row" layout-align="space-between center">
                       <div class="accordion-toggle-button" layout="row" layout-align="start center" ng-click="toggleAccordion()" flex>
                          <div>{{label}}</div>
                          <ng-transclude></ng-transclude>
                          <md-button class="md-icon-button accordian-closed-icon pos-right" aria-label="Accordion Toggle">
                             <md-icon md-font-icon="mdi-chevron-right" class="mdi s20 black-fg"></md-icon>
                          </md-button>
                          <md-button class="md-icon-button accordian-open-icon pos-right" aria-label="Accordion Toggle">
                             <md-icon md-font-icon="mdi-chevron-down" class="mdi s20 black-fg"></md-icon>
                          </md-button>

                       </div>
                    </div>`,
      compile: function (tElement) {
         tElement.addClass('accordion-toggle');

         return function postLink(scope, iElement, iAttrs, AccordionCtrl) {
            scope.toggleAccordion = AccordionCtrl.toggleAccordion;
         };
      },
   };
}

/** @ngInject */
function accordionHeaderDirective() {
   return {
      restrict: 'E',
      require: '^accordion',
      transclude: true,
      replace: true,
      scope: {
         close: '&onClose',
      },
      template: `<div class="accordian-header" ng-click="toggleAccordion()">
           <md-button class="md-icon-button accordian-header-closed-icon" aria-label="Accordion Toggle">
              <md-icon md-font-icon="mdi-chevron-down" class="mdi s20 black-fg"></md-icon>
           </md-button>
           <ng-transclude></ng-transclude>
        </div>`,
      compile: function (tElement) {
         tElement.addClass('accordion-toggle');

         return function postLink(scope, iElement, iAttrs, AccordionCtrl) {
            if (iAttrs.onClose !== undefined) {
               scope.toggleAccordion = function () {
                  scope.close();
               };
            } else {
               scope.toggleAccordion = AccordionCtrl.toggleAccordion;
            }
         };
      },
   };
}

/** @ngInject */
function accordionContentDirective() {
   return {
      restrict: 'E',
      require: '^accordion',
      transclude: true,
      replace: true,
      template: '<div flex layout="column" flex ng-transclude ng-cloak></div>',
      compile: function (tElement) {
         tElement.addClass('accordion-content');
      },
   };
}
