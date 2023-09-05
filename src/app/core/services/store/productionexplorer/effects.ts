import Rx from 'rx';
import { IApiResolverService } from "./../../../../reference";
import { getPagedItems } from "../../clientData.store";
import { INIT_EXPLORER_DATA, SET_EXPLORER_DATA_CURRENT_RANGE, AddExplorerData, SetExplorerAvailableDateRange, INIT_DEVICE_EXPLORER_DATA, SET_DEVICE_EXPLORER_DATA_CURRENT_RANGE, AddDeviceExplorerData, SetDeviceExplorerAvailableDateRange } from "./actions";
import { IExplorerDataRecord } from "./models";
import { Action, Dispatcher } from "../../lib/store";

export class ProductionExplorerEffects {
      constructor(
            private actions: Rx.Observable<Action>,
            private apiResolver: IApiResolverService,
            private clientDataDispatcher: Dispatcher
      ) { }

      private getPagedItems<T>(apiname: string, skiptake: { skip: number, take: number, startDate: Date, endDate: Date }, apiResolver: IApiResolverService) {
            let getPage = function <T>(skiptake) {

                  return Rx.Observable.fromPromise<T[]>(apiResolver.resolve(apiname, skiptake));
            }
            let result = getPage<T>(skiptake)
                  .flatMap(data => {
                        let result = Rx.Observable.return(data);
                        if (data.length === skiptake.take) {
                              result = result.concat(getPagedItems(apiname, { ...skiptake, skip: skiptake.skip + skiptake.take, take: skiptake.take }, apiResolver));
                        }
                        return result;
                  });
            return result;
      }

      loadExplorerData$: Rx.Observable<Action> = this.actions
            .filter(action => action.type === INIT_EXPLORER_DATA || action.type === SET_EXPLORER_DATA_CURRENT_RANGE)
            .flatMap(a => {
                  return this.getPagedItems<IExplorerDataRecord>('explorer.data@get', { skip: 0, take: 1000, startDate: a.payload.startDate, endDate: a.payload.endDate }, this.apiResolver);
            })
            .map(data => new AddExplorerData(data));

      loadAvailableRange$ = this.actions
            .filter(action => action.type === INIT_EXPLORER_DATA)
            .flatMap(_ => {
                  return Rx.Observable.fromPromise<{ maxDate: string, minDate: string }>(this.apiResolver.resolve('explorer.range@get'));
            })
            .map(data => ({ maxDate: new Date(data.maxDate), minDate: new Date(data.minDate) }))
            .map(range => new SetExplorerAvailableDateRange(range));

      loadDeviceExplorerData$: Rx.Observable<Action> = this.actions
            .filter(action => action.type === INIT_DEVICE_EXPLORER_DATA || action.type === SET_DEVICE_EXPLORER_DATA_CURRENT_RANGE)
            .flatMap(a => {
                  return this.getPagedItems<IExplorerDataRecord>('explorer.device.data@get', { skip: 0, take: 1000, startDate: a.payload.startDate, endDate: a.payload.endDate }, this.apiResolver);
            })
            .map(data => new AddDeviceExplorerData(data));

      loadDeviceAvailableRange$ = this.actions
            .filter(action => action.type === INIT_DEVICE_EXPLORER_DATA)
            .flatMap(_ => {
                  return Rx.Observable.fromPromise<{ maxDate: string, minDate: string }>(this.apiResolver.resolve('explorer.device.range@get'));
            })
            .map(data => ({ maxDate: new Date(data.maxDate), minDate: new Date(data.minDate) }))
            .map(range => new SetDeviceExplorerAvailableDateRange(range));
}