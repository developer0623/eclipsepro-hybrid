import {
  SingleOrderActions,
  INITSINGLEORDER,
  InitSingleOrder,
  SETREBUNDLERESULT,
  SetRebundleResult,
  SAVEREBUNDLESUCCESSFUL,
  CANCELBUNDLERESULT
} from './actions';
import {
  ISingleOrderState,
} from '../../../dto';

export function SingleOrderStateReducer(state: ISingleOrderState, action: SingleOrderActions): ISingleOrderState {
  switch (action.type) {
    case INITSINGLEORDER:
      const a = <InitSingleOrder>action;
      return {
        ordId: a.ordId,
        clearRebundleOnNextPut: false,
        rebundleResult: null
      };
    case SETREBUNDLERESULT:
      return {
        ...state,
        rebundleResult: (<SetRebundleResult>action).rebundleResult,
      };
    case SAVEREBUNDLESUCCESSFUL:
      return {
        ...state,
        clearRebundleOnNextPut: true,
      }
    case CANCELBUNDLERESULT:
      return {
        ...state,
        rebundleResult: null
      }
    case '[PUT]':
      if(state?.clearRebundleOnNextPut) {
        return {
          ...state,
          rebundleResult: null,
          clearRebundleOnNextPut: false
        }
      }
      return state;
  }
  return state;
}