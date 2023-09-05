import { Fx, ISystemInfo, ILanguage, IProductionSummaryReportRecord, IUserSession } from "../dto";
import { PUT, DEL, INITIALIZE, CHOP, ADD_SUBSCRIPTION, DEL_SUBSCRIPTION, SIGNALR_CONNECTED, SIGNALR_DISCONNECTED, FRESH_PRODUCTION_SUMMARY, USER_AUTHED_SUCCESSFULLY, LOGOUT, All, SubscriptionAction, SIGNALR_RECONNECTED } from "./clientData.actions";
import { Action } from "./lib/store";


/**
Note this is a reducer constructor. It creates a reducer that works against the standard `PUT` / `DELETE`
pattern.
*/
export function collectionReducer<T extends { id: string | number }>(collection: string) {

    let _putOne = (state: Array<T>, payload: T) => {
        if (typeof payload !== 'object') { //we should fix the server but not crash if we get bad data.
            console.error("`payload` is not an object", payload);
            return state;
        }
        if (!('id' in payload)) {
            console.error(payload);
            throw "object in collection '" + collection + "' does not have 'id' property"
        }
        let tobj = state.find(t => t.id === payload.id);
        if (tobj) {
            return state.map(t => t.id === payload.id ? payload : t);
        }
        else {
            return [...state, payload];
        }
    }
    let _delOne = (state: Array<T>, id: string) => {
        // Sometimes ids have the document type and sometimes they don't
        
        // todo: this doesn't belong here. Find a better place.
        // This collection is sourced from a raven artificial document. It seems that those get deleted and recreated (at least this one).
        // When that happens, the screen flashes. 
        if (collection === 'MachineStatistics')
        {
            return state;
        }
        let idOnly = (id.indexOf('/') > 0 ? id.substring(id.indexOf('/') + 1) : id);
        return state.filter(t => t.id !== id && t.id !== idOnly);
    }

    return (state: Array<T> = [], action: All<T>) => {
        if (action.collection === collection) {
            switch (action.type) {
                case PUT: {
                    return _putOne(state, action.payload);
                }
                case DEL: {
                    return _delOne(state, action.id);
                }
                case INITIALIZE: {
                    return action.payload.reduce((state, obj) => {
                        return _putOne(state, obj);
                    }, state);
                }
                case CHOP: {
                    // Remove any objects that don't fall into a subscription
                    const chopFilter = action
                        .subscriptions
                        .map(s => Fx.toFilterExpr(s.filterDef))
                        .reduce((acc, filt) => t => acc(t) || filt(t), _ => false)
                    return state.filter(chopFilter);
                }
            }
        }
        return state;
    }
}
export function Subscriptions(state: Fx.Subscription[] = [], action: SubscriptionAction) {
    switch (action.type) {
        case ADD_SUBSCRIPTION: {
            return [...state, action.payload];
        }
        case DEL_SUBSCRIPTION: {
            return state.filter(s => s.id !== action.payload.id);
        }
    }
    return state;
}

export function SignalRConnectionId(state: string = "", action: Action) {
    switch (action.type) {
        case SIGNALR_CONNECTED: return action.payload as string;
        case SIGNALR_RECONNECTED: return action.payload as string;
        case SIGNALR_DISCONNECTED: return "";
    }
    return state;
}

const initialSystemInfo = { serverId: '', version: '', serverStartTime: null, isSignalRConnected: false, latestReleaseVersion: null };

export function SystemInfoReducer(state: ISystemInfo = initialSystemInfo, action: Action) {
    switch (action.type) {
        case SIGNALR_CONNECTED: return { ...state, isSignalRConnected: true };
        case SIGNALR_RECONNECTED: return { ...state, isSignalRConnected: true };
        case SIGNALR_DISCONNECTED: return { ...state, isSignalRConnected: false };
        // SystemInfo can't use the singleton collection reducer because it has
        // client side only members. Server sent data does not have them.
        case PUT:
        case INITIALIZE: {
            if (action.collection === "SystemInfo")
                return { ...state, ...action.payload };
        }
    }
    return state;
}

/**
    Use this reducer constructor when the `collection` is a single instance.
    The instance need not have an `id`. In fact, this is handy
    for when the singleton is an array.
*/
export function collectionReducerSingleton<T>(collection: string, initial: T) {
    return (state: T = initial, action: All<T>) => {
        if (action.collection === collection) {
            switch (action.type) {
                // There is no concept of 'deleting' a singleton.
                // (I suppose we could use DEL as a reset...but don't code it
                // till we need it.)
                case PUT: {
                    return action.payload;
                }
                case INITIALIZE: {
                    // This cast is necessary because the Initialize class
                    // should have different signatures between single and
                    // regular collections, but does not.
                    return action.payload as unknown as T;
                }
            }
        }
        return state;
    }
}

export function ProductionSummaryReport(state: IProductionSummaryReportRecord[] = [], action: Action) {
    switch (action.type) {
        case FRESH_PRODUCTION_SUMMARY: {
            return action.payload;
        }
    }
    return state;
}

export function UserSessionReducer(state: IUserSession | null = null, action: Action): IUserSession | null {
    switch (action.type) {
        case USER_AUTHED_SUCCESSFULLY:
            return action.payload;
        case LOGOUT:
            return null;
    }
    return state;
}