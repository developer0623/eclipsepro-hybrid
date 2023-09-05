import * as angular from 'angular';
import coilTypesModule from './coil-types/coil-types.module';
import coilTypeModule from "./coil-type/coil-type.module";
import coilsModule from "./coils/coils.module";
import coilModule from "./coil/coil.module";

export default angular
   .module('app.inventory', [
      coilTypesModule,
      coilTypeModule,
      coilsModule,
      coilModule
   ])
   .config(config)
   .run(runBlock)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.inventory', {
      abstract: true
   });

   // Navigation
   msNavigationServiceProvider.saveItem('inventory', {
      title: 'inventory',
      icon: 'mdi-clipboard-check',
      weight: 5,
      claims: 'pro.inventory',
   });
}

/** @ngInject */
function runBlock() {
   /**
   * Material-coil datatable default options
   */
}

// /** @ngInject */
// runBlock.$inject = ['DTDefaultOptions']
// function runBlock(DTDefaultOptions) {
//    /**
//    * Material-coil datatable default options
//    */
//    DTDefaultOptions.setDOM('rt<\"bottom layout-row layout-align-space-between-center\"<\"flex layout-row layout-align-space-between-center\"<\"length\"l><\"layout-row layout-align-space-between-center\"<\"info\"i><\"pagination\"p>>>>');
// }
