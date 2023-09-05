import { IJobItem, JobScheduleState, IJobBundle, IJobSummaryDto, RebundleResult } from "../../../dto";
import { IAppState } from "..";
import * as _ from "lodash";

export interface IBundleModel {
  /** The number assigned to this bundle, within the job. Like an identity,
   * but in the scope of this order only.
   */
  bundleNo: number;
  /** Total weight of this bundle. */
  weightLbs: number;
  /** Total piece count of this bundle. */
  pieces: number;
  /** Max weight allowed in this bundle, per the bundle rules in effect. */
  maxWeightLbs: number;
  /** Max pieces allowed in this bundle, per the bundle rules in effect. */
  maxPieces: number;
  /** Length of the shortest piece in this bundle. */
  bundleMinLengthIn: number;
  /** Length of the longest piece in this bundle. */
  bundleMaxLengthIn: number;
  /** Length of the longest piece in this order. */
  orderMaxLengthIn: number;
  /** The shortest piece in this bundle can only be this much shorter (by percent) than the longest piece in the bundle, per the bundle rules in effect. */
  minPercentOfMaxLength: number;
  /** Avoids a compiler error because I was being lazy at the time. */
  checked: boolean;
}
// Similar to IBundlingRule...
export type BundleRules = {
  id: number;
  maxPieceCount: number;
  maxWeightLbs: number;
  minPctOfMaxLength: number;
  itemSort: 'LongToShort' | 'ShortToLong';
};

export function ComputeBundlesModel(
  rules: BundleRules,
  job_items: IJobItem[]
): IBundleModel[] {
  return _(job_items)
    .groupBy(i => i.bundle)
    .map((bundle_items, bundle) => {
      const _bundle_items = _(bundle_items);
      return {
        bundleNo: Number(bundle),
        weightLbs: _bundle_items.map(x => x.weightLbs).sum(),
        pieces: _bundle_items.map(x => x.quantity).sum(),

        maxWeightLbs: rules.maxWeightLbs,
        maxPieces: rules.maxPieceCount,
        bundleMinLengthIn: _bundle_items
          .map(x => x.lengthIn)
          .filter(x => x > 0) // zero is used on message only lines and is not produced.
          .min(),
        bundleMaxLengthIn: _bundle_items.map(x => x.lengthIn).max(),
        orderMaxLengthIn: _(job_items)
          .map(x => x.lengthIn)
          .max(),
        minPercentOfMaxLength: rules.minPctOfMaxLength,
        checked: false,
      };
    })
    .value();
}

// Throw this in the bundlesModel array if you want to see all the alertng features.
export const badBundle: IBundleModel = {
  bundleNo: 1,
  weightLbs: 2562,
  pieces: 1999,
  maxWeightLbs: 1500,
  maxPieces: 2000,
  bundleMinLengthIn: 46,
  bundleMaxLengthIn: 100,
  orderMaxLengthIn: 150,
  minPercentOfMaxLength: 0.5,
  checked: false,
};

export type SingleOrderModel = ReturnType<ReturnType<typeof SingleOrder>>;

export function applyRebundleResult(bundles: RebundleResult, items: IJobItem[]) {
  const rebundledItems = bundles.rebundledItems.map((b, idx) => ({
    // use the original item as the prototype for this new item
    ...items.find(i => i.itemId === b.prototypeItemId),
    ...b,
    weightLbs: ((b.quantity * b.lengthIn) / 12) * bundles.lbsPerFt,
    itemId: b.itemId, //-(idx + 1),
    prototypeItemId: b.prototypeItemId,
  }));

  return rebundledItems;
}

export const SingleOrder = (ordId: number) => (state: IAppState) =>
  state.JobDetail.filter(x => x.ordId === ordId)
    .map(jobd => {
      // If we're scheduled, then tack on the machine info
      const schState = jobd.job.scheduleState;
      if (schState.state === 'Scheduled') {
        schState['machine'] = state.Machine.find(
          m => m.machineNumber === schState.machineNumber
        );
      }

      const bundleRules = state.BundleRules.find(r => r.id === ordId);

      const hasUnsavedBundleChanges = state.SingleOrder?.rebundleResult
        ? true
        : false;

      const items = hasUnsavedBundleChanges
        ? applyRebundleResult(state.SingleOrder.rebundleResult, jobd.items)
        : jobd.items.map(i => ({ ...i, prototypeItemId: i.itemId }));

      return {
        ...jobd,
        job: {
          ...jobd.job,
          requiredDate: jobd.job.requiredDate
            ? new Date(jobd.job.requiredDate)
            : null,
          scheduleState: schState,
        },
        items,
        completePerc: (jobd.job.completeFt / jobd.job.totalFt) * 100,
        bundlesModel: bundleRules
          ? ComputeBundlesModel(bundleRules, items)
          : [],
        hasUnsavedBundleChanges,
        rebundleResult: state.SingleOrder?.rebundleResult,
        // Agent rejects rebundling unless the job is in one of these states.
        allowRebundling:
          'SEQD UNSCHED'.indexOf(jobd.job.legacyStatus.toUpperCase()) >= 0,
      };
    })
    .find(x => true); // aka, firstOrDefault

export const ConsumptionSummaryForOrder = (ordId: number) => (state: IAppState) => {
  const history = state.ConsumptionHistory.filter((x: any) => x.ordId === ordId);
  return history.map(x => {
    const newM = state.Machine.find(m => m.machineNumber === x.machineNumber);
    if (newM) {
      return {
        ...x,
        machine: newM
      }
    }

    return x;

  });
};

export const ProducedBundlesForOrder = (ordId: number) => (state: IAppState) => {
  const bundles = state.BundleResult.filter(x => x.ordId === ordId);
  return _.orderBy(bundles, ['id'], ['desc']);
};
