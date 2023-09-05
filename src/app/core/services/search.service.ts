import * as angular from "angular";
import { Ams } from "../../amsconfig";

type SearchItem = {
   entity: 'View',
   sref: string,
   entityId: string
}
type SearchService = {
   showSearch: boolean
   search: () => any
   currentSearch: string
   searchText: string
   selectedItemChange: (item: SearchItem) => void
};

searchService.$inject = ['$rootScope', '$http', '$state']

export function searchService($rootScope, $http: angular.IHttpService, $state) {
   const service: SearchService = {
      showSearch: false,
      search() {
         //send request to server. Start with $http, then use signalR. We might need to rip out md-autocomplete as it is a bit tricky to work with.
         service.currentSearch = service.searchText;
         $rootScope.showloader = true;
         return $http.get(Ams.Config.BASE_URL + '/api/search?q=' + service.currentSearch).then(
            function (data) {
               console.log(data);
               $rootScope.showloader = false;
               return (data.data);
            },
            function (error) {
               console.log(error);
               return ([]);
            });
      },
      currentSearch: '',
      searchText: '',      //next search
      selectedItemChange(item) {
         if (item) {
            console.log(item);
            service.searchText = '';
            service.showSearch = false;

            //note:this sucks. Figure out how to pass parameters from the api results
            //$state.go(item.sref, item.srefParams);
            if (item.entity === 'View') {
               $state.go(item.sref);
            } else {
               $state.go(item.sref, { id: item.entityId });
            }
         }
      }
   };

   return service;
}
