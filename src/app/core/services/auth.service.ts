import * as angular from "angular";
import { Ams } from "../../amsconfig";
import { IApiResolverService, IAuthService } from "../../reference";
import { IUserSession } from "../dto";
import { UserAuthedSuccessfully } from "./clientData.actions";
import { ClientDataStore } from "./clientData.store";
import rg4js from "raygun4js";

authService.$inject = ['apiResolver', 'clientDataStore']
export function authService(apiResolver: IApiResolverService, clientDataStore: ClientDataStore) {

   const authService: IAuthService = {
      getSession: () =>
         apiResolver.resolve('user.session@get')
            .then((userSession: IUserSession) => {
               clientDataStore.Dispatch(new UserAuthedSuccessfully(userSession));
               rg4js('setUser', {
                  identifier: `${userSession.userName}@${userSession.serverId}`,
                  isAnonymous: userSession.userName === 'guest',
                  //email:
                  //firstName: 'Firstname',
                  //fullName: 'Firstname Lastname'
                  //uuid:
               });

               return userSession;
            }),
      logout: () => {
         window.location.href = `${Ams.Config.BASE_URL}/auth/logout`;
      },
   };

   return authService;
}

interceptorConfig.$inject = ['$httpProvider']

export function interceptorConfig($httpProvider: ng.IHttpProvider) {
   // If we have an auth token, add it to every request.

   let authenticationProvidingHttpInterceptor: ng.IHttpInterceptorFactory = ($q, $injector) => {
      return {
         // If we ever get an auth rejection (401), redirect to '/auth/login', a server rendered view.
         responseError: (rejection) => {
            rg4js("send", {
               error: "Failed $http request",
               customData: { rejection: rejection },
            });

            console.log('22222')

            if (rejection.status === 401) {
               let $mdToast = $injector.get("$mdToast");
               $mdToast.show(
                  $mdToast
                     .simple()
                     .textContent("Authorization Failed!")
                     .position("top right")
                     .hideDelay(3000)
                     .parent("#content")
               );

               window.location.href = `${Ams.Config.BASE_URL}/auth/login?redirectUrl=${window.location.href}`;
            }
            return $q.reject(rejection);
         },
         requestError: (rejection) => {
            rg4js("send", {
               error: "Failed $http response",
               customData: { rejection: rejection },
            });
            return $q.reject(rejection);
         },
      };
   };
   authenticationProvidingHttpInterceptor.$inject = ['$q', '$injector'];

   $httpProvider.interceptors.push(authenticationProvidingHttpInterceptor);
}
