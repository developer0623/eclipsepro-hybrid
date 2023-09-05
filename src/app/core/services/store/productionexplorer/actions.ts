import { IExplorerDataRecord } from "./models";


export const ADD_EXPLORER_DATA = 'ADD_EXPLORER_DATA';
export const INIT_EXPLORER_DATA = 'INIT_EXPLORER_DATA';
export const SET_EXPLORER_AVAILABLE_DATE_RANGE = 'SET_EXPLORER_AVAILABLE_DATE_RANGE';
export const SET_EXPLORER_DATA_CURRENT_RANGE = 'SET_EXPLORER_DATA_CURRENT_RANGE';

export const ADD_DEVICE_EXPLORER_DATA = 'ADD_DEVICE_EXPLORER_DATA';
export const INIT_DEVICE_EXPLORER_DATA = 'INIT_DEVICE_EXPLORER_DATA';
export const SET_DEVICE_EXPLORER_AVAILABLE_DATE_RANGE = 'SET_DEVICE_EXPLORER_AVAILABLE_DATE_RANGE';
export const SET_DEVICE_EXPLORER_DATA_CURRENT_RANGE = 'SET_DEVICE_EXPLORER_DATA_CURRENT_RANGE';

export interface IDateRange {
   minDate: Date
   maxDate: Date
}
export class AddExplorerData {
   readonly type = ADD_EXPLORER_DATA;
   constructor(public payload: IExplorerDataRecord[]) { }
}

export class SetExplorerAvailableDateRange {
   readonly type = SET_EXPLORER_AVAILABLE_DATE_RANGE;
   constructor(public payload: IDateRange) { }
}
export class InitExplorerData {
   readonly type = INIT_EXPLORER_DATA;
   constructor(public payload: { startDate: Date, endDate: Date }) { }
}

export class SetExplorerDataCurrentRange {
   readonly type = SET_EXPLORER_DATA_CURRENT_RANGE;
   constructor(public payload: { startDate: Date, endDate: Date }) { }
}
export class AddDeviceExplorerData {
   readonly type = ADD_DEVICE_EXPLORER_DATA;
   constructor(public payload: IExplorerDataRecord[]) { }
}

export class SetDeviceExplorerAvailableDateRange {
   readonly type = SET_DEVICE_EXPLORER_AVAILABLE_DATE_RANGE;
   constructor(public payload: IDateRange) { }
}
export class InitDeviceExplorerData {
   readonly type = INIT_DEVICE_EXPLORER_DATA;
   constructor(public payload: { startDate: Date, endDate: Date }) { }
}

export class SetDeviceExplorerDataCurrentRange {
   readonly type = SET_DEVICE_EXPLORER_DATA_CURRENT_RANGE;
   constructor(public payload: { startDate: Date, endDate: Date }) { }
}
