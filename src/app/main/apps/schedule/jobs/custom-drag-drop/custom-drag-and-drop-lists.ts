import angular from 'angular';

const customDnd = angular.module('customDnd', []);

customDnd.directive('cdndDraggable', [
  '$parse',
  '$timeout',
  function ($parse, $timeout) {
    return function (scope, element, attr) {
      // Set the HTML5 draggable attribute on the element.
      element.attr('draggable', 'true');

      element.on('dragstart', function (event: any) {
        event = event.originalEvent || event;

        // Check whether the element is draggable, since dragstart might be triggered on a child.
        if (element.attr('draggable') === 'false') return true;
        dndState.itemType = attr.cdndType;

        // Add CSS classes. See documentation above.
        element.addClass('dndDragging');
        $timeout(function () {
          element.addClass('dndDraggingSource');
        }, 0);

        if (attr.dragSourceData) {
          let dragSourceData = scope.$eval(attr.dragSourceData);
          event.dataTransfer.setData(
            'dragSourceData',
            JSON.stringify(dragSourceData)
          );
        }

        // Invoke dragstart callback
        if (attr.cdndDragstart) {
          $parse(attr.cdndDragstart)(scope, { event: event });
        }

        // Notify the target areas by calling the function they registered.
        if (attr.cdndType) {
          const callbacks =
            dndState.allowedTypeDragStartRegistry[attr.cdndType];
          if (callbacks) {
            for (const callback of callbacks) {
              // It may have been unregistered, which means the position was
              // set to null.
              if (callback) {
                callback({ cdndType: attr.cdndType });
              }
            }
          }
        }

        event.stopPropagation();
      });

      /**
       * The dragend event is triggered when the element was dropped or when the drag
       * operation was aborted (e.g. hit escape button). Depending on the executed action
       * we will invoke the callbacks specified with the dnd-moved or dnd-copied attribute.
       */
      element.on('dragend', function (event: any) {
        event = event.originalEvent || event;

        // Notify the target areas by calling the function they registered.
        if (attr.cdndType) {
          const callbacks =
            dndState.allowedTypeDragEndRegistry[attr.cdndType];
          if (callbacks) {
            for (const callback of callbacks) {
              // it may have been unregistered, which means it's position was set to null.
              if (callback) {
                callback({ cdndType: attr.cdndType });
              }
            }
          }
        }

        element.removeClass('dndDragging');
        element.removeClass('dndDraggingSource');
        element.removeClass(
          'draggingover draggingover-west draggingover-east draggingover-north draggingover-south'
        );
        event.preventDefault();
        event.stopPropagation();
      });
    };
  },
]);

customDnd.directive('cdndArea', [
  '$parse',
  '$timeout',
  function ($parse, $timeout) {
    return function (scope, element, attr) {
      const areaType = scope.$eval(attr.cdndAreatype);

      // Register to receive cdnd-allowed-drag-start notifications, from the drag
      // types we accept.
      let allowedTypes: string[] = scope.$eval(attr.cdndAllowedTypes);
      if (allowedTypes && attr.cdndAllowedDragStart) {
        for (const allowedType of allowedTypes) {
          // This callback gets executed by the dragStart of
          // elements of our allowed dragTypes.

          if (!dndState.allowedTypeDragStartRegistry[allowedType])
            dndState.allowedTypeDragStartRegistry[allowedType] = [];

          const callbacks =
            dndState.allowedTypeDragStartRegistry[allowedType];

          const position = callbacks.length;
          callbacks[position] = extraScope => {
            scope.$apply(function () {
              $parse(attr.cdndAllowedDragStart)(scope, { ...extraScope });
            });
          };

          scope.$on('$destroy', () => {
            callbacks[position] = null;
          });
        }
      }

      // Register to receive cdnd-allowed-drag-end notifications, from the drag
      // types we accept.
      if (allowedTypes && attr.cdndAllowedDragEnd) {
        for (const allowedType of allowedTypes) {
          // This callback gets executed by the dragEnd of
          // elements of our allowed dragTypes.

          if (!dndState.allowedTypeDragEndRegistry[allowedType])
            dndState.allowedTypeDragEndRegistry[allowedType] = [];

          const callbacks = dndState.allowedTypeDragEndRegistry[allowedType];

          const position = callbacks.length;
          callbacks[position] = extraScope => {
            scope.$apply(function () {
              $parse(attr.cdndAllowedDragEnd)(scope, { ...extraScope });
            });
          };

          scope.$on('$destroy', () => {
            callbacks[position] = null;
          });
        }
      }

      /**
       * The dragover event is triggered "every few hundred milliseconds" while an element
       * is being dragged over our list, or over an child element.
       */
      element.on('dragover', function (event: any) {
        event = event.originalEvent || event;

        if (!isDropAllowed(allowedTypes, dndState.itemType)) return true;
        event.preventDefault();

        const hemi =
          event.layerY > element[0].clientHeight / 2 ? 'south' : 'north';
        const otherhemi =
          event.layerX > element[0].clientWidth / 2 ? 'east' : 'west';

        console.log('dragover', areaType, hemi, otherhemi);

        element.removeClass(
          'draggingover-west draggingover-east draggingover-north draggingover-south'
        );
        element.addClass('draggingover');
        element.addClass('draggingover-' + hemi);
        element.addClass('draggingover-' + otherhemi);

        scope.$apply(function () {
          $parse(attr['cdndDragover'])(scope, {
            event: event,
            hemi,
            otherhemi,
          });
        });

        return false;
      });

      element.on('drop', function (event: any) {
        event = event.originalEvent || event;
        let itemType = event.dataTransfer.getData('cdndtype');
        element.removeClass(
          'draggingover draggingover-west draggingover-east draggingover-north draggingover-south'
        );

        const hemi =
          event.layerY > element[0].clientHeight / 2 ? 'south' : 'north';
        const otherhemi =
          event.layerX > element[0].clientWidth / 2 ? 'east' : 'west';

        const dsd = event.dataTransfer.getData('dragSourceData');
        const dragSourceData = dsd ? JSON.parse(dsd) : undefined;

        if (attr.cdndDrop) {
          $parse(attr.cdndDrop)(scope, {
            event,
            hemi,
            otherhemi,
            dragSourceData,
          });
        }

        event.preventDefault();
      });

      element.on('dragenter', function (event: any) {
        let types = scope.$eval(attr.cdndAllowedTypes);
        if (!isDropAllowed(types, dndState.itemType)) return true;
        event = event.originalEvent || event;
        event.preventDefault();

        return false;
      });

      element.on('dragleave', function (event: any) {
        event = event.originalEvent || event;
        event.preventDefault();

        element.removeClass(
          'draggingover draggingover-west draggingover-east draggingover-north draggingover-south'
        );

        return false;
      });

      function isDropAllowed(types, itemType) {
        return types.indexOf(itemType) > -1;
      }
    };
  },
]);

const dndState = {
  itemType: null,
  allowedTypeDragStartRegistry: [],
  allowedTypeDragEndRegistry: [],
};
export default customDnd.name;
