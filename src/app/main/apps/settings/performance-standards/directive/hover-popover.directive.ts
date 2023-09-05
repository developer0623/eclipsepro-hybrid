// Todo
// interface JQuery {
//     // I think this member comes from a jquery plugin, hence that is why it
//     // doesn't appear in the @types/jquery.
//     popover(a:string| {}):void;
// }

// (function ()
// {
//     'use strict';

//     angular
//         .module('app.core')
//         .directive('hoverPopover', hoverPopoverDirective);

//     /** @ngInject */
//     function hoverPopoverDirective($timeout, $rootScope)
//     {
//         return {
//             restrict: 'A',
//             controller: function ($scope, $element) {
//                 $scope.attachEvents = function (element) {
//                     $('.popover').on('mouseenter', function () {
//                         console.log("mouseenter popover", $rootScope.insidePopover);
//                         $rootScope.insidePopover = false;
//                     });
//                     $('.popover').on('mouseleave', function () {
//                         $rootScope.insidePopover = false;
//                         $(element).popover('hide');
//                     });
//                     $('.popover').on('mouseclick', function () {
//                         console.log("mouseclick popover", $rootScope.insidePopover);
//                         $rootScope.insidePopover = false;
//                         $(element).popover('hide');
//                     });
//                 };
//             },
//             link: function (scope, element, attrs) {
                
//                     $rootScope.insidePopover = false;
                    
//                     $(element).popover({
//                         contentUrl: "app/main/apps/settings/performance-standards/components/templates/popover.html",
//                         placement: 'right',
//                         html: true
//                     });
//                     $(element).bind('mouseenter', function (e) {
//                       console.log("mouseenter element", $rootScope.insidePopover);
//                         $timeout(function () {
//                             if (!$rootScope.insidePopover) {
//                                 $(element).popover('show');
//                                 scope.attachEvents(element);
//                             }
//                         }, 50);
//                     });
//                     $(element).bind('mouseleave', function (e) {
//                         $timeout(function () {
//                             if (!$rootScope.insidePopover)
//                                 $(element).popover('hide');
//                         }, 50);
//                     });
//                     $(element).bind('mouseclick', function (e) {
//                         console.log("mouseclick element", $rootScope.insidePopover);
//                         $timeout(function () {
//                             if ($rootScope.insidePopover)
//                                 $(element).popover('hide');
//                         }, 50);
//                     });           
                
//             }
//         };
//     }

// })();


// // });
