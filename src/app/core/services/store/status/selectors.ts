import * as _ from "lodash";
import { IHealth, HealthSummaryType } from "../../../dto";
import { IAppState } from "..";

export const Healths = (appState: IAppState) => appState.Health;

export const HealthSummary = (appState): HealthSummaryType[] => {
   const healths = appState.Health as IHealth[];
   return _(healths)
      .groupBy(h => h.status)
      .map((subs, collection) => ({ collection, count: subs.length }))
      .value(); // remove the lodash wrapper
}; 