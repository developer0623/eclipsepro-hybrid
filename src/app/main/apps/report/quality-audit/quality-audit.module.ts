import angular from 'angular';
import QualityAuditReport_ from './quality-audit-report.component';

export default angular
  .module('app.report.quality-audit', [])
  .component(QualityAuditReport_.selector, QualityAuditReport_)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_quality-audit', {
    url: '/report/quality-audit',
    title: '',
    views: {
      'content@app': {
        template: '<quality-audit-report></quality-audit-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.quality-audit', {
    title: 'Quality Audit',
    state: 'app.report_quality-audit',
    weight: 47,
    claims: 'pro.machine.reports',
    badge: { content: '🧪' },
  });
}
