import angular from 'angular';
import VerticalTemplage from './templates/vertical.html';

export default angular
    .module('app.core.nav', [])
    .provider('msNavigationService', [msNavigationServiceProvider])
    .controller('MsNavigationController', ['$scope', 'msNavigationService', MsNavigationController])
    // Vertical
    .directive('msNavigation', ['$rootScope', '$timeout', '$mdSidenav', 'msNavigationService', '$window', msNavigationDirective])
    .controller('MsNavigationNodeController', ['$scope', '$element', '$rootScope', '$animate', '$state', 'msNavigationService', 'featureFlagService', 'userClaimsService', '$mdDialog', MsNavigationNodeController])
    .directive('msNavigationNode', [msNavigationNodeDirective])
    .directive('msNavigationItem', [msNavigationItemDirective])
    .name;


function msNavigationServiceProvider()
{
    // Inject $log service
    const $log: any = angular.injector(['ng']).get('$log');

    // Navigation array
    let navigation = [];

    let service = this;

    // Methods
    service.saveItem = saveItem;
    service.deleteItem = deleteItem;
    service.sortByWeight = sortByWeight;

    //////////

    /**
     * Create or update the navigation item
     *
     * @param path
     * @param item
     */
    function saveItem(path, item)
    {
        if ( !angular.isString(path) )
        {
            $log.error('path must be a string (eg. `dashboard.project`)');
            return;
        }

        let parts = path.split('.');

        // Generate the object id from the parts
        const id = parts[parts.length - 1];

        // Get the parent item from the parts
        const parent = _findOrCreateParent(parts);

        // Decide if we are going to update or create
        let updateItem: any = false;

        for ( let i = 0; i < parent.length; i++ )
        {
            if ( parent[i]._id === id )
            {
                updateItem = parent[i];

                break;
            }
        }

        // Update
        if ( updateItem )
        {
            angular.extend(updateItem, item);

            // Add proper ui-sref
            updateItem.uisref = _getUiSref(updateItem);
        }
        // Create
        else
        {
            // Create an empty children array in the item
            item.children = [];

            // Add the default weight if not provided or if it's not a number
            if ( angular.isUndefined(item.weight) || !angular.isNumber(item.weight) )
            {
                item.weight = 1;
            }

            // Add the item id
            item._id = id;

            // Add the item path
            item._path = path;

            // Add proper ui-sref
            item.uisref = _getUiSref(item);

            // Push the item into the array
            parent.push(item);
        }
    }

    /**
     * Delete navigation item
     *
     * @param path
     */
    function deleteItem(path)
    {
        if ( !angular.isString(path) )
        {
            $log.error('path must be a string (eg. `dashboard.project`)');
            return;
        }

        // Locate the item by using given path
        let item = navigation,
            parts = path.split('.');

        for ( let p = 0; p < parts.length; p++ )
        {
            const id = parts[p];

            for ( let i = 0; i < item.length; i++ )
            {
                if ( item[i]._id === id )
                {
                    // If we have a matching path,
                    // we have found our object:
                    // remove it.
                    if ( item[i]._path === path )
                    {
                        item.splice(i, 1);
                        return true;
                    }

                    // Otherwise grab the children of
                    // the current item and continue
                    item = item[i].children;
                    break;
                }
            }
        }

        return false;
    }

    /**
     * Sort the navigation items by their weights
     *
     * @param parent
     */
    function sortByWeight(parent)
    {
        // If parent not provided, sort the root items
        if ( !parent )
        {
            parent = navigation;
            parent.sort(_byWeight);
        }

        // Sort the children
        for ( let i = 0; i < parent.length; i++ )
        {
            let children = parent[i].children;

            if ( children.length > 1 )
            {
                children.sort(_byWeight);
            }

            if ( children.length > 0 )
            {
                sortByWeight(children);
            }
        }
    }

    /* ----------------- */
    /* Private Functions */
    /* ----------------- */

    /**
     * Find or create parent
     *
     * @param parts
     * @returns {Array|Boolean}
     * @private
     */
    function _findOrCreateParent(parts)
    {
        // Store the main navigation
        let parent = navigation;

        // If it's going to be a root item
        // return the navigation itself
        if ( parts.length === 1 )
        {
            return parent;
        }

        // Remove the last element from the parts as
        // we don't need that to figure out the parent
        parts.pop();

        // Find and return the parent
        for ( let i = 0; i < parts.length; i++ )
        {
            let _id = parts[i],
                createParent = true;

            for ( let p = 0; p < parent.length; p++ )
            {
                if ( parent[p]._id === _id )
                {
                    parent = parent[p].children;
                    createParent = false;

                    break;
                }
            }

            // If there is no parent found, create one, push
            // it into the current parent and assign it as a
            // new parent
            if ( createParent )
            {
                let item = {
                    _id     : _id,
                    _path   : parts.join('.'),
                    title   : _id,
                    weight  : 1,
                    children: []
                };

                parent.push(item);
                parent = item.children;
            }
        }

        return parent;
    }

    /**
     * Sort by weight
     *
     * @param x
     * @param y
     * @returns {number}
     * @private
     */
    function _byWeight(x, y)
    {
        return parseInt(x.weight) - parseInt(y.weight);
    }

    /**
     * Setup the ui-sref using state & state parameters
     *
     * @param item
     * @returns {string}
     * @private
     */
    function _getUiSref(item)
    {
        let uisref = '';

        if ( angular.isDefined(item.state) )
        {
            uisref = item.state;

            if ( angular.isDefined(item.stateParams) && angular.isObject(item.stateParams) )
            {
                uisref = uisref + '(' + angular.toJson(item.stateParams) + ')';
            }
        }

        return uisref;
    }

   function getClaimsForName(name: string) {
      let item = findItemBySref(navigation, name);
      return item?.claims;
   }

   function findItemBySref(tree, sref: string) {
      for (let n = 0; n < tree.length; n++) {
         if (tree[n].uisref === sref) {
            return tree[n];
         }
         if (tree[n].children) {
            let next = findItemBySref(tree[n].children, sref);
            if (next) return next;
         }
      }
      return null;
   }

    /* ----------------- */
    /* Service           */
    /* ----------------- */

    this.$get = function ()
    {
        let activeItem = null,
            navigationScope = null,
            folded = null,
            foldedOpen = null;

        const service = {
            saveItem           : saveItem,
            deleteItem         : deleteItem,
            sort               : sortByWeight,
            clearNavigation    : clearNavigation,
            setActiveItem      : setActiveItem,
            getActiveItem      : getActiveItem,
            getNavigationObject: getNavigationObject,
            setNavigationScope : setNavigationScope,
            setFolded          : setFolded,
            getFolded          : getFolded,
            setFoldedOpen      : setFoldedOpen,
            getFoldedOpen      : getFoldedOpen,
            toggleFolded       : toggleFolded,
            getClaimsForName   : getClaimsForName,
        };

        return service;

        //////////

        /**
         * Clear the entire navigation
         */
        function clearNavigation()
        {
            // Clear the navigation array
            navigation = [];

            // Clear the vm.navigation from main controller
            if ( navigationScope )
            {
                navigationScope.vm.navigation = [];
            }
        }

        /**
         * Set active item
         *
         * @param node
         * @param scope
         */
        function setActiveItem(node, scope)
        {
            activeItem = {
                node : node,
                scope: scope
            };
        }

        /**
         * Return active item
         */
        function getActiveItem()
        {
            return activeItem;
        }

        /**
         * Return navigation object
         *
         * @param root
         * @returns {Array}
         */
        function getNavigationObject(root)
        {
            if ( root )
            {
                for ( let i = 0; i < navigation.length; i++ )
                {
                    if ( navigation[i]._id === root )
                    {
                        return [navigation[i]];
                    }
                }
            }

            return navigation;
        }

        /**
         * Store navigation's scope for later use
         *
         * @param scope
         */
        function setNavigationScope(scope)
        {
            navigationScope = scope;
        }

        /**
         * Set folded status
         *
         * @param status
         */
        function setFolded(status)
        {
            folded = status;
        }

        /**
         * Return folded status
         *
         * @returns {*}
         */
        function getFolded()
        {
            return folded;
        }

        /**
         * Set folded open status
         *
         * @param status
         */
        function setFoldedOpen(status)
        {
            foldedOpen = status;
        }

        /**
         * Return folded open status
         *
         * @returns {*}
         */
        function getFoldedOpen()
        {
            return foldedOpen;
        }


        /**
         * Toggle fold on stored navigation's scope
         */
        function toggleFolded()
        {
            navigationScope.toggleFolded();
        }
    };
}


function MsNavigationController($scope, msNavigationService)
{
    let vm = this;

    // Data
    if ( $scope.root )
    {
        vm.navigation = msNavigationService.getNavigationObject($scope.root);
    }
    else
    {
        vm.navigation = msNavigationService.getNavigationObject();
    }

    // Methods

    //////////

    init();

    /**
     * Initialize
     */
    function init()
    {
        // Sort the navigation before doing anything else
        msNavigationService.sort();
    }

}

function msNavigationDirective($rootScope, $timeout, $mdSidenav, msNavigationService, $window)
{
    return {
        restrict   : 'E',
        scope      : {
            folded: '=',
            root  : '@'
        },
        controller : ['$scope', 'msNavigationService', MsNavigationController],
        controllerAs: 'vm',
        template: VerticalTemplage,
        transclude : true,
        compile    : function (tElement)
        {
            tElement.addClass('ms-navigation');

            return function postLink(scope, iElement)
            {
                let bodyEl = angular.element('body'),
                    foldExpanderEl = angular.element('<div id="ms-navigation-fold-expander"></div>'),
                    foldCollapserEl = angular.element('<div id="ms-navigation-fold-collapser"></div>'),
                    sidenav = $mdSidenav('navigation');

                // Store the navigation in the service for public access
                msNavigationService.setNavigationScope(scope);

                // Initialize
                init();

                /**
                 * Initialize
                 */
                function init()
                {
                    // Set the folded status for the first time.
                    // First, we have to check if we have a folded
                    // status available in the service already. This
                    // will prevent navigation to act weird if we already
                    // set the fold status, remove the navigation and
                    // then re-initialize it, which happens if we
                    // change to a view without a navigation and then
                    // come back with history.back() function.

                    // If the service didn't initialize before, set
                    // the folded status from scope, otherwise we
                    // won't touch anything because the folded status
                    // already set in the service...
                    if ( msNavigationService.getFolded() === null )
                    {
                        msNavigationService.setFolded(scope.folded);
                    }

                    if ( msNavigationService.getFolded() )
                    {
                        // Collapse everything.
                        // This must be inside a $timeout because by the
                        // time we call this, the 'msNavigation::collapse'
                        // event listener is not registered yet. $timeout
                        // will ensure that it will be called after it is
                        // registered.
                        $timeout(function ()
                        {
                            $rootScope.$broadcast('msNavigation::collapse');
                        });

                        // Add class to the body
                        bodyEl.addClass('ms-navigation-folded');

                        // Set fold expander
                        setFoldExpander();
                    }
                }

                // Sidenav locked open status watcher
                scope.$watch(function ()
                {
                    return sidenav.isLockedOpen();
                }, function (current, old)
                {
                    if ( angular.isUndefined(current) || angular.equals(current, old) )
                    {
                        return;
                    }

                    let folded = msNavigationService.getFolded();

                    if ( folded )
                    {
                        if ( current )
                        {
                            // Collapse everything
                            $rootScope.$broadcast('msNavigation::collapse');
                        }
                        else
                        {
                            // Expand the active one and its parents
                            let activeItem = msNavigationService.getActiveItem();
                            if ( activeItem )
                            {
                                activeItem.scope.$emit('msNavigation::stateMatched');
                            }
                        }
                    }
                });

                // Folded status watcher
                scope.$watch('folded', function (current, old)
                {
                    if ( angular.isUndefined(current) || angular.equals(current, old) )
                    {
                        return;
                    }

                    setFolded(current);
                });

                /**
                 * Set folded status
                 *
                 * @param folded
                 */
                function setFolded(folded)
                {
                    // Store folded status on the service for global access
                    msNavigationService.setFolded(folded);

                    if ( folded )
                    {
                        // Collapse everything
                        $rootScope.$broadcast('msNavigation::collapse');

                        // Add class to the body
                        bodyEl.addClass('ms-navigation-folded');

                        // Set fold expander
                        setFoldExpander();
                    }
                    else
                    {
                        // Expand the active one and its parents
                        let activeItem = msNavigationService.getActiveItem();
                        if ( activeItem )
                        {
                            activeItem.scope.$emit('msNavigation::stateMatched');
                        }

                        // Remove body class
                        bodyEl.removeClass('ms-navigation-folded ms-navigation-folded-open');

                        // Remove fold collapser
                        removeFoldCollapser();
                    }
                }

                /**
                 * Set fold expander
                 */
                function setFoldExpander()
                {
                    iElement.parent().append(foldExpanderEl);

                    // Let everything settle for a moment
                    // before registering the event listener
                    $timeout(function ()
                    {
                        foldExpanderEl.on('mouseenter touchstart', onFoldExpanderHover);
                    });
                }

                /**
                 * Set fold collapser
                 */
                function setFoldCollapser()
                {
                    bodyEl.find('#main').append(foldCollapserEl);
                    foldCollapserEl.on('mouseenter touchstart', onFoldCollapserHover);
                }

                /**
                 * Remove fold collapser
                 */
                function removeFoldCollapser()
                {
                    foldCollapserEl.remove();
                }

                /**
                 * onHover event of foldExpander
                 */
                function onFoldExpanderHover(event)
                {
                    if ( event )
                    {
                        event.preventDefault();
                    }

                    // Set folded open status
                    msNavigationService.setFoldedOpen(true);

                    // Expand the active one and its parents
                    let activeItem = msNavigationService.getActiveItem();
                    if ( activeItem )
                    {
                        activeItem.scope.$emit('msNavigation::stateMatched');
                    }

                    // Add class to the body
                    bodyEl.addClass('ms-navigation-folded-open');

                    // Remove the fold opener
                    foldExpanderEl.remove();

                    // Set fold collapser
                    setFoldCollapser();
                }

                /**
                 * onHover event of foldCollapser
                 */
                function onFoldCollapserHover(event?)
                {
                    if ( event )
                    {
                        event.preventDefault();
                    }

                    // Set folded open status
                    msNavigationService.setFoldedOpen(false);

                    // Collapse everything
                    $rootScope.$broadcast('msNavigation::collapse');

                    // Remove body class
                    bodyEl.removeClass('ms-navigation-folded-open');

                    // Remove the fold collapser
                    foldCollapserEl.remove();

                    // Set fold expander
                    setFoldExpander();
                }

                /**
                 * Public access for toggling folded status externally
                 */
                scope.toggleFolded = function ()
                {
                    let folded = msNavigationService.getFolded();

                    setFolded(!folded);
                };

                /**
                 * On $stateChangeStart
                 */
                scope.$on('$stateChangeStart', function ()
                {
                    // Close the sidenav
                    sidenav.close();

                    // If navigation is folded open, close it
                    if ( msNavigationService.getFolded() )
                    {
                        onFoldCollapserHover();
                    }
                });

               //  scope.$on('$locationChangeStart', function(event, next, current) {
               //    // if ($scope.form.$invalid) {
               //       event.preventDefault();
               //       $window.history.back();
               //       scope.$apply();
               //    // }
               // });

                // Cleanup
                scope.$on('$destroy', function ()
                {
                    foldCollapserEl.off('mouseenter touchstart');
                    foldExpanderEl.off('mouseenter touchstart');
                });
            };
        }
    };
}

MsNavigationNodeController.$inject = ['$scope', '$element', '$rootScope', '$animate', '$state', 'msNavigationService', 'featureFlagService', 'userClaimsService', '$mdDialog']
function MsNavigationNodeController($scope, $element, $rootScope, $animate, $state, msNavigationService, featureFlagService, userClaimsService, $mdDialog)
{
    let vm = this;

    // Data
    vm.element = $element;
    vm.node = $scope.node;
    vm.hasChildren = undefined;
    vm.collapsed = undefined;
    vm.collapsable = undefined;
    vm.group = undefined;
    vm.animateHeightClass = 'animate-height';
    vm.warningSaved = false;

    // Methods
    vm.toggleCollapsed = toggleCollapsed;
    vm.collapse = collapse;
    vm.expand = expand;
    vm.getClass = getClass;
    vm.isHidden = isHidden;
    vm.gotoLocation = gotoLocation;
    vm.getActiveClass = getActiveClass;

    //////////

    init();

    /**
     * Initialize
     */

    function gotoLocation(ev, url) {
      if(vm.warningSaved) {
         let confirm = $mdDialog.confirm()
         .title('There are unsaved changes.')
         // .textContent('All of the banks have agreed to forgive you your debts.')
         .ariaLabel('Warning Alert')
         .targetEvent(ev)
         .ok('Discard changes')
         .cancel('Go back');

         $mdDialog.show(confirm).then(() => {
            $state.go(url);
         }, () => {
            // $scope.status = 'You decided to keep your debt.';
         });
      } else {
         $state.go(url);
      }

    }

    function getActiveClass(url) {
      if($state.includes(url)) {
         return 'active md-primary-bg md-hue-2'
      }
      return ''
    }
    function init()
    {
        // Setup the initial values

        // Has children?
        vm.hasChildren = vm.node.children.length > 0;

        // Is group?
        vm.group = !!(angular.isDefined(vm.node.group) && vm.node.group === true);

        // Is collapsable?
        if ( !vm.hasChildren || vm.group )
        {
            vm.collapsable = false;
        }
        else
        {
            vm.collapsable = !!(angular.isUndefined(vm.node.collapsable) || typeof vm.node.collapsable !== 'boolean' || vm.node.collapsable === true);
        }

        // Is collapsed?
        if ( !vm.collapsable )
        {
            vm.collapsed = false;
        }
        else
        {
            vm.collapsed = !!(angular.isUndefined(vm.node.collapsed) || typeof vm.node.collapsed !== 'boolean' || vm.node.collapsed === true);
        }

        // Expand all parents if we have a matching state or
        // the current state is a child of the node's state
        if ( vm.node.state === $state.current.name || $state.includes(vm.node.state) )
        {
            // If state params are defined, make sure they are
            // equal, otherwise do not set the active item
            if ( angular.isDefined(vm.node.stateParams) && angular.isDefined($state.params) && !angular.equals(vm.node.stateParams, $state.params) )
            {
                return;
            }

            $scope.$emit('msNavigation::stateMatched');

            // Also store the current active menu item
            msNavigationService.setActiveItem(vm.node, $scope);
        }

        $scope.$on('msNavigation::stateMatched', function ()
        {
            // Expand if the current scope is collapsable and is collapsed
            if ( vm.collapsable && vm.collapsed )
            {
                $scope.$evalAsync(function ()
                {
                    vm.collapsed = false;
                });
            }
        });

        // Listen for collapse event
        $scope.$on('msNavigation::collapse', function (event, path)
        {
            if ( vm.collapsed || !vm.collapsable )
            {
                return;
            }

            // If there is no path defined, collapse
            if ( angular.isUndefined(path) )
            {
                vm.collapse();
            }
            // If there is a path defined, do not collapse
            // the items that are inside that path. This will
            // prevent parent items from collapsing
            else
            {
                let givenPathParts = path.split('.'),
                    activePathParts = [];

                let activeItem = msNavigationService.getActiveItem();
                if ( activeItem )
                {
                    activePathParts = activeItem.node._path.split('.');
                }

                // Test for given path
                if ( givenPathParts.indexOf(vm.node._id) > -1 )
                {
                    return;
                }

                // Test for active path
                if ( activePathParts.indexOf(vm.node._id) > -1 )
                {
                    return;
                }

                vm.collapse();
            }
        });

        // Listen for $stateChangeSuccess event
        $scope.$on('$stateChangeSuccess', function ()
        {
            if ( vm.node.state === $state.current.name )
            {
                // If state params are defined, make sure they are
                // equal, otherwise do not set the active item
                if ( angular.isDefined(vm.node.stateParams) && angular.isDefined($state.params) && !angular.equals(vm.node.stateParams, $state.params) )
                {
                    return;
                }

                // Update active item on state change
                msNavigationService.setActiveItem(vm.node, $scope);

                // Collapse everything except the one we're using
                $rootScope.$broadcast('msNavigation::collapse', vm.node._path);
            }
        });

         $scope.$on('warningSaved', function (event, data) {
               vm.warningSaved = data;
         });
    }

    /**
     * Toggle collapsed
     */
    function toggleCollapsed()
    {
        if ( vm.collapsed )
        {
            vm.expand();
        }
        else
        {
            vm.collapse();
        }
    }

    /**
     * Collapse
     */
    function collapse()
    {
        // Grab the element that we are going to collapse
        let collapseEl = vm.element.children('ul');

        // Grab the height
        let height = collapseEl[0].offsetHeight;

        $scope.$evalAsync(function ()
        {
            // Set collapsed status
            vm.collapsed = true;

            // Add collapsing class to the node
            vm.element.addClass('collapsing');

            // Animate the height
            $animate.animate(collapseEl,
                {
                    'display': 'block',
                    'height' : height + 'px'
                },
                {
                    'height': '0px'
                },
                vm.animateHeightClass
            ).then(
                function ()
                {
                    // Clear the inline styles after animation done
                    collapseEl.css({
                        'display': '',
                        'height' : ''
                    });

                    // Clear collapsing class from the node
                    vm.element.removeClass('collapsing');
                }
            );

            // Broadcast the collapse event so child items can also be collapsed
            $scope.$broadcast('msNavigation::collapse');
        });
    }

    /**
     * Expand
     */
    function expand()
    {
        // Grab the element that we are going to expand
        let expandEl = vm.element.children('ul');

        // Move the element out of the dom flow and
        // make it block so we can get its height
        expandEl.css({
            'position'  : 'absolute',
            'visibility': 'hidden',
            'display'   : 'block',
            'height'    : 'auto'
        });

        // Grab the height
        let height = expandEl[0].offsetHeight;

        // Reset the style modifications
        expandEl.css({
            'position'  : '',
            'visibility': '',
            'display'   : '',
            'height'    : ''
        });

        $scope.$evalAsync(function ()
        {
            // Set collapsed status
            vm.collapsed = false;

            // Add expanding class to the node
            vm.element.addClass('expanding');

            // Animate the height
            $animate.animate(expandEl,
                {
                    'display': 'block',
                    'height' : '0px'
                },
                {
                    'height': height + 'px'
                },
                vm.animateHeightClass
            ).then(
                function ()
                {
                    // Clear the inline styles after animation done
                    expandEl.css({
                        'height': ''
                    });

                    // Clear expanding class from the node
                    vm.element.removeClass('expanding');
                }
            );

            // If item expanded, broadcast the collapse event from rootScope so that the other expanded items
            // can be collapsed. This is necessary for keeping only one parent expanded at any time
            $rootScope.$broadcast('msNavigation::collapse', vm.node._path);
        });
    }

    /**
     * Return the class
     *
     * @returns {*}
     */
    function getClass()
    {
        return vm.node.class;
    }

    /**
     * Check if node should be hidden
     *
     * @returns {boolean}
     */
    function isHidden()
    {
        if ( angular.isDefined(vm.node.featureFlag) ) {
            if (featureFlagService.featureDisabled(vm.node.featureFlag)) {
                return true;
            }
        }

        if ( angular.isDefined(vm.node.hidden) && angular.isFunction(vm.node.hidden) ) {
            return vm.node.hidden();
        }

        if (angular.isDefined(vm.node.claims)) {
            return userClaimsService.hasClaim(vm.node.claims) === false;
        }

        return false;
    }
    return vm;
}


function msNavigationNodeDirective()
{
    return {
        restrict        : 'A',
        bindToController: {
            node: '=msNavigationNode'
        },
        controller      : 'MsNavigationNodeController as vm',
        compile         : function (tElement)
        {
            tElement.addClass('ms-navigation-node');

            return function postLink(scope, iElement, iAttrs, MsNavigationNodeCtrl)
            {
                // Add custom classes
                iElement.addClass(MsNavigationNodeCtrl.getClass());

                // Add group class if it's a group
                if ( MsNavigationNodeCtrl.group )
                {
                    iElement.addClass('group');
                }
            };
        }
    };
}


function msNavigationItemDirective()
{
    return {
        restrict: 'A',
        require : '^msNavigationNode',
        compile : function (tElement)
        {
            tElement.addClass('ms-navigation-item');

            return function postLink(scope, iElement, iAttrs, MsNavigationNodeCtrl)
            {
                // If the item is collapsable...
                if ( MsNavigationNodeCtrl.collapsable )
                {
                    iElement.on('click', MsNavigationNodeCtrl.toggleCollapsed);
                }

                // Cleanup
                scope.$on('$destroy', function ()
                {
                    iElement.off('click');
                });
            };
        }
    };
}
