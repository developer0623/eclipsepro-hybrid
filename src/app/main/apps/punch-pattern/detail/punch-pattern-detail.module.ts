import angular from "angular";
import PunchPatternDetail from "./punch-pattern-detail.component";
import PunchRowComp from './punch-row.component';
export default angular
   .module("app.punch-patterns.detail", [])
   .component(PunchPatternDetail.selector, PunchPatternDetail)
   .component(PunchRowComp.selector, PunchRowComp)
   .config(config).name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state("app.punch-patterns_list.detail", {
      url: "/{id}",
      title: "",
      views: {
         "content@app": {
            template: "<punch-pattern-detail></punch-pattern-detail>",
         },
      },
   });
}
