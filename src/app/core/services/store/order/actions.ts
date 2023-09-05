import { Action } from "../../lib/store";
import { RebundleResult } from '../../../dto';
export const INITSINGLEORDER = '[INITSINGLEORDER]'
export const SETREBUNDLERESULT = '[SETREBUNDLERESULT]'
export const SAVEREBUNDLERESULT = '[SAVEREBUNDLERESULT]'
export const SAVEREBUNDLESUCCESSFUL = '[SAVEREBUNDLESUCCESSFUL]'
export const CANCELBUNDLERESULT = '[CANCELBUNDLERESULT]'

export class InitSingleOrder implements Action {
    type = INITSINGLEORDER;
    constructor(public ordId: number) { }
}

export class SetRebundleResult implements Action {
    type = SETREBUNDLERESULT;
    constructor(public rebundleResult: RebundleResult) { }
}

export class SaveRebundleResult implements Action {
    type = SAVEREBUNDLERESULT;
    constructor(public ordId: number, public rebundleResult: RebundleResult) { }
}

export class CancelBundleResult implements Action {
    type = CANCELBUNDLERESULT;
}

export class SaveRebundleSuccessful implements Action {
    type = SAVEREBUNDLESUCCESSFUL;
}

export type SingleOrderActions = InitSingleOrder | SetRebundleResult | SaveRebundleSuccessful | SaveRebundleResult | CancelBundleResult