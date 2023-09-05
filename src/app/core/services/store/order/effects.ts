import Rx from 'rx';
import { IApiResolverService } from "./../../../../reference";
import {
      SAVEREBUNDLERESULT,
      SaveRebundleResult,
      SaveRebundleSuccessful
} from "./actions";
import { Action, Dispatcher } from "../../lib/store";
import { Ams } from '../../../../amsconfig';
export class OrderEffects {
      constructor(
            private actions: Rx.Observable<Action>,
            private apiResolver: IApiResolverService,
            private $http: angular.IHttpService,
            private clientDataDispatcher: Dispatcher,
            private $mdToast,
            private $rootScope
      ) { }

      processBundleSaveRequests$ = this.actions
            .filter(a => a.type === SAVEREBUNDLERESULT)
            .map(a => <SaveRebundleResult>a)
            .flatMap(a => Rx.Observable.fromPromise(this.$http.post(`${Ams.Config.BASE_URL}/api/order/${a.ordId}/applyrebundle`, a.rebundleResult)))
            .map(_ => new SaveRebundleSuccessful())
            .do(_ => {
                  console.log('rebundling changes saved');
                  this.$rootScope.$broadcast('warningSaved', false);
            })
            .do(_ => this.$mdToast.show(
                  this.$mdToast
                        .simple()
                        .textContent("Rebundling changes saved")
                        .position('top right')
                        .hideDelay(2000)
                        .parent('#content')))
            .doOnError((ex: { data: { errors?: string[] } }) => this.$mdToast.show(
                  this.$mdToast
                        .simple()
                        .textContent("Unable to save rebundling changes. " + ex.data.errors?.join())
                        .position('top right')
                        .hideDelay(2000)
                        .parent('#content')));
}