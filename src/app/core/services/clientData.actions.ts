import { Fx, IProductionSummaryReportRecord, IUserSession } from "../dto";
import { Action } from "./lib/store";
import { Collection } from "./clientData.store";


export const PUT = '[PUT]';
export const DEL = '[DEL]';
export const INITIALIZE = '[INITIALIZE]';
export const CHOP = '[CHOP]';
export const ADD_SUBSCRIPTION = '[ADD_SUBSCRIPTION]';
export const DEL_SUBSCRIPTION = '[DEL_SUBSCRIPTION]';
export const SIGNALR_CONNECTED = '[SIGNALR_CONNECTED]';
export const SIGNALR_RECONNECTED = '[SIGNALR_RECONNECTED]';
export const SIGNALR_DISCONNECTED = '[SIGNALR_DISCONNECTED]';
export const RESET = '[RESET]';
export const FRESH_PRODUCTION_SUMMARY = '[FRESH_PRODUCTION_SUMMARY]';
export const USER_AUTHED_SUCCESSFULLY = '[USER_AUTHED_SUCCESSFULLY]';
export const UI_UPDATE_AVAILABLE = '[UI_UPDATE_AVAILABLE]';
export const USER_AUTHED_TRIED = '[USER_AUTHED_TRIED]';
export const LOGOUT = '[LOGOUT]';

export class Reset implements Action {
  readonly type = RESET;
  constructor() { }
}

export class Put<T> implements Action {
  readonly type = PUT;
  constructor(public collection: Collection, public payload: T) { }
}

export class Del<T> implements Action {
  readonly type = DEL;
  constructor(public collection: Collection, public id: string) { }
}

export class Initialize<T> implements Action {
  readonly type = INITIALIZE;
  constructor(public collection: string, public payload: T[]) { }
}

export class Chop implements Action {
  readonly type = CHOP;
  constructor(
    public collection: string,
    public subscriptions: Fx.Subscription[]
  ) { }
}

export class AddSubscription implements Action {
  readonly type = ADD_SUBSCRIPTION;
  constructor(public payload: Fx.Subscription) { }
}
export class DelSubscription implements Action {
  readonly type = DEL_SUBSCRIPTION;
  constructor(public payload: Fx.Subscription) { }
}

export type All<T> = Put<T> | Del<T> | Initialize<T> | Chop;
export type SubscriptionAction = AddSubscription | DelSubscription;

export class SignalrConnectedAction implements Action {
  readonly type = SIGNALR_CONNECTED;
}

export class SignalrReconnectedAction implements Action {
  readonly type = SIGNALR_RECONNECTED;
}
export class SignalrDisconnectedAction {
  readonly type = SIGNALR_DISCONNECTED;
}

export class FreshProductionSummary implements Action {
  readonly type = FRESH_PRODUCTION_SUMMARY;
  constructor(public payload: IProductionSummaryReportRecord[]) { }
}
export class UserAuthedSuccessfully implements Action {
  readonly type = USER_AUTHED_SUCCESSFULLY;
  constructor(public payload: IUserSession) { }
}