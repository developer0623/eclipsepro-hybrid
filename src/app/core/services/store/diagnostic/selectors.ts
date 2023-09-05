import * as _ from "lodash"
import { Fx } from "../../../dto"
import { IAppState } from ".."


export const DebugCollectionMetrics = (state: IAppState) => state.DebugCollectionMetrics
export const DebugActionMetrics = (state: IAppState) => state.DebugActionMetrics

export const PerformanceData = (state: IAppState) => ({
   DebugCollectionMetrics: state.DebugCollectionMetrics,
   DebugActionMetrics: state.DebugActionMetrics,
   DebugSubscriptionMetrics:
      _(state.Subscriptions as Fx.Subscription[])
         .groupBy(s => s.collection)
         .map((subs, collection) => ({ collection, count: subs.length }))
         .value() // remove the lodash wrapper
})
