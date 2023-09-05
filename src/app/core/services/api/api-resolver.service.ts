import angular from 'angular';
import { IApiResolverService } from "../../../reference";

apiResolverService.$inject = ['$q', '$log', 'api'];
export function apiResolverService($q, $log, api) {
   let service: IApiResolverService = {
      resolve: resolve
   };

   return service;

   //////////
   /**
   * Resolve api
   * @param action
   * @param parameters
   */
   function resolve(action: string, parameters) {
      let actionParts = action.split('@'),
         resource = actionParts[0],
         method = actionParts[1],
         params = parameters || {};

      if (!resource || !method) {
         $log.error('apiResolver.resolve requires correct action parameter (ResourceName@methodName)');
         return false;
      }

      // Create a new deferred object
      let deferred = $q.defer();

      // Get the correct api object from api service
      let apiObject = getApiObject(resource);

      if (!apiObject) {
         $log.error('Resource "' + resource + '" is not defined in the api service!');
         deferred.reject('Resource "' + resource + '" is not defined in the api service!');
      }
      else {
         apiObject[method](params,
            // Success
            function (response) {
               deferred.resolve(response);
            },
            // Error
            function (response) {
               deferred.reject(response);
            }
         );
      }

      // Return the promise
      return deferred.promise;
   }

   /**
   * Get correct api object
   *
   * @param resource
   * @returns {*}
   */
   function getApiObject(resource) {
      // Split the resource in case if we have a dot notated object
      let resourceParts = resource.split('.'),
         apiObject = api;

      // Loop through the resource parts and go all the way through
      // the api object and return the correct one
      for (let l = 0; l < resourceParts.length; l++) {
         if (angular.isUndefined(apiObject[resourceParts[l]])) {
            $log.error('Resource part "' + resourceParts[l] + '" is not defined!');
            apiObject = false;
            break;
         }
         apiObject = apiObject[resourceParts[l]];
      }

      if (!apiObject) {
         return false;
      }

      return apiObject;
   }
}
