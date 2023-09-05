import { Subject, BehaviorSubject, Observable } from "rx";
import equal from "fast-deep-equal";

// This implementation is inspired by https://gist.github.com/btroncone/a6e4347326749f938510
export class Action {
  constructor(
    public type: string, public payload?: any, public collection?: string
  ) { }
}
export interface IAction<TPayload> {
  type: string,
  payload?: TPayload
}

export class Dispatcher extends Subject<Action> {
  dispatch(value: Action): void {
    let that: any = this; // TODO: Fix this
    that.onNext(value);
  }
}

export type Reducer<S> = (state: S, action: Action) => S;

export type ReducersMapObject<S> = {
  [K in keyof S]: Reducer<S[K]>
}

export function combineReducers<S>(reducers: ReducersMapObject<S>) /* : Reducer<S> */ {
  return (state: S = {} as S, action: Action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, state);
  };
}

export function appendReducers<S>(first: Reducer<S>, second: Reducer<S>): Reducer<S> {
  return (state, action) => second(first(state, action), action);
}


export class DataStore<TAppState> extends BehaviorSubject<TAppState> {
  constructor(
    private dispatcher: Dispatcher,
    private reducer: Reducer<TAppState>,
    initialState: TAppState) {
    super(initialState);

    const anyDispatcher: any = this.dispatcher;
    anyDispatcher
      //      .do(console.log) // prints all actions
      .scan((state, action) => this.reducer(state, action), initialState)
      //      .do(console.log) // prints the store
      .subscribe(state => super.onNext(state));
  }

  /**
  Choose a subset of the data by string name.
  */
  public Select<TKey>(key: string): Observable<TKey> {
    const that: any = this;
    return that
      .map(state => state[key])
      // Deep equals not necessary because were getting the object
      // directly off the state. Well written reducers will not 
      // update the state unnecessarily.
      .distinctUntilChanged();
  }

  /**
  Choose a subset of the data by using a selector function.
  */
  public Selector<T>(selector: (state: TAppState) => T): Observable<T> {
    const that: any = this;
    return that
      .map(selector)
      // Include a deep-equals here because selector functions create 
      // a new instance every time. The distinctUntilChanged's default 
      // === would always emit.
      .distinctUntilChanged(undefined, (a, b) => equal(a, b)); //equal(a, b, '$') // if we were using fast-deep-equal before, I don't know what the '$' parameter is.
  }

  Dispatch<TPayload>(action: IAction<TPayload>) {
    this.dispatcher.dispatch(action);
  }
  // Including the `any` type spec avoids a compilation error.
  onNext(action: Action | any) {
    this.dispatcher.dispatch(action);
  }
}

export class EffectsModule {
  static run(dispatcher: Dispatcher, effects: any[]) {
    for (const effectType of effects) {
      for (const key in effectType) {
        if (effectType.hasOwnProperty(key) && key.endsWith('$')) {
          const effect: Observable<Action> = effectType[key];
          // Execute the effect observable for it's side effects
          // AND dispatch any actions it may emit.
          effect.subscribe(action => {
            //console.table(action);
            dispatcher.dispatch(action);
          },
            error => console.error(error));
        }
      }
    }
  }
}
