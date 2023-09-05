import * as dc from 'dc';
// import * as d3 from 'd3';
import * as crossfilter from 'crossfilter';
declare let d3: any

export { CoilData, IReducedData, IData, loadCrossFilter, loadDeviceCrossFilter }

class CoilData {
  coilSerialNumber: string;
}
class OperatorData {
  employeeNumber: string;
  employeeName: string;
}
class LossCode {
  codeValue: string;
  codeDescription: string;
}
interface IData {
  employeeNumber: string;
  goodFt: number;
  goodLocal: number;
  date: any;
  shift: any;
  machine: { machineNumber: number, machineDescription: string };
  materialCode: string;
  toolingCode: string;
  partLengthIn: number;
  partLengthLocal: number;
  customerName: string;
  punching: boolean;
  coil: CoilData;
  operator: OperatorData;
  targetAvailabilityPotentialFt: number;
  yieldPotentialFt: number;
  speedPotentialFt: number;
  targetPercent: number;
  availabilityPercent: number;
  speedPercent: number;
  yieldPercent: number;
  scrapLengthFt: number;
  lossCode: LossCode;
  availabilityPotentialFt: number;
  downMinutes: number;
  scrapLengthLocal: number;
}
interface IReducedData {
  goodLocal: number;
  goodFt: number;
  targetAvailabilityPotentialFt?: number;
  speedPotentialFt: number;
  yieldPotentialFt: number;
  availabilityPotentialFt: number;
  allDownMinutes: number;
  scrapLengthLocal: number;
  targetPercent: number;
  availabilityPercent: number;
  speedPercent: number;
  yieldPercent: number;
  oeePercent: number;
}

export type IPathfinderExplorerData = {
  id: string;
  deviceId: string;
  partId: string;
  operator: string;
  runState: 'Running' | 'NotRunning';
  cycles: number;
  goodParts: number;
  duration: string;
  start: Date;
  end: Date;
};

export type IPathfinderReducedData = {
  goodParts: number;
  cycles: number;
};

export function reduceInitial(): number {
  return 0;
}

function loadCrossFilter(
  data: IData[],
  filterFn: (item: IData) => boolean,
  reduceAddFn: (p: number, v: IData) => number,
  reduceRemoveFn: (p: number, v: IData) => number,
  reuceOrderFn: (p: IReducedData) => number
) {
  let rawData = data;

  const crossFilter = crossfilter(rawData.filter(filterFn));
  const reduceAdd = reduceAddFn;
  const reduceRemove = reduceRemoveFn;
  const reduceOrderFn = d => d;

  const byDayDimension = crossFilter.dimension(d =>
    d3.time.day(new Date(d.date))
  );
  const byShiftDimension = crossFilter.dimension(d => d.shift);
  const byHourOfDayDimension = crossFilter.dimension(d => d.hourOfDay);
  const byDayOfWeekDimension = crossFilter.dimension(d => d.dayOfWeek);
  const byMachineDimension = crossFilter.dimension(
    d => d.machine.machineDescription + ' [' + d.machine.machineNumber + ']'
  );
  const byMaterialDimension = crossFilter.dimension(d => d.materialCode);
  const byProductDimension = crossFilter.dimension(d => d.toolingCode);
  const byPartLengthDimension = crossFilter.dimension(d =>
    d.partLengthIn > 0 ? Math.ceil(d.partLengthLocal) : 0
  );
  const byCustomerDimension = crossFilter.dimension(d => d.customerName);
  const byCoilDimension = crossFilter.dimension(d => d.coil.coilSerialNumber);
  const byCoilVendorDimension = crossFilter.dimension(
    d => d.coilVendor.vendorCode
  );
  const byOperatorDimension = crossFilter.dimension(
    d => '[' + d.operator.employeeNumber + ']' + d.operator.employeeName
  );
  const byPunchedDimension = crossFilter.dimension(d =>
    d.punching ? 'Yes' : 'No'
  );
  const byReasonDimension = crossFilter.dimension(
    d => d.lossCode.codeValue + ' ' + d.lossCode.codeDescription
  );

  return {
    update: (newData?) => {
      if (newData) rawData = newData;

      crossFilter.remove();
      crossFilter.add(rawData.filter(filterFn));
      dc.redrawAll();
    },

    resetAll: () => {
      dc.filterAll();
      dc.renderAll();
    },

    byDayDimension: byDayDimension,
    byDayGroup: byDayDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byShiftDimension: byShiftDimension,
    byShiftGroup: byShiftDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byHourOfDayDimension: byHourOfDayDimension,
    byHourOfDayGroup: byHourOfDayDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byDayOfWeekDimension: byDayOfWeekDimension,
    byDayOfWeekGroup: byDayOfWeekDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byMachineDimension: byMachineDimension,
    byMachineGroup: byMachineDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byMaterialDimension: byMaterialDimension,
    byMaterialGroup: byMaterialDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byProductDimension: byProductDimension,
    byProductGroup: byProductDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byPartLengthDimension: byPartLengthDimension,
    byPartLengthGroup: removeEmptyBins(
      byPartLengthDimension
        .group()
        .reduce(reduceAdd, reduceRemove, reduceInitial)
        .order(reduceOrderFn)
    ),

    byCustomerDimension: byCustomerDimension,
    byCustomerGroup: byCustomerDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byCoilDimension: byCoilDimension,
    byCoilGroup: byCoilDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byCoilVendorDimension: byCoilVendorDimension,
    byCoilVendorGroup: byCoilVendorDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byOperatorDimension: byOperatorDimension,
    byOperatorGroup: byOperatorDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byReasonDimension: byReasonDimension,
    byReasonGroup: byReasonDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),

    byPunchedDimension: byPunchedDimension,
    byPunchedGroup: byPunchedDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(reduceOrderFn),
  };
}

function loadDeviceCrossFilter(
  data: IPathfinderExplorerData[],
  filterFn: (item: IPathfinderExplorerData) => boolean,
  reduceAddFn: (p: number, v: IPathfinderExplorerData) => number,
  reduceRemoveFn: (p: number, v: IPathfinderExplorerData) => number,
  reduceOrderFn: (p: IPathfinderReducedData) => number
) {
  let rawData = data;

  const crossFilter = crossfilter(rawData.filter(filterFn));
  const reduceAdd = reduceAddFn;
  const reduceRemove = reduceRemoveFn;
  const reduceOrder = d => d;

  const byDayDimension = crossFilter.dimension(d =>
    d3.time.day(new Date(d.end))
  );
  const byMachineDimension = crossFilter.dimension(d => d.deviceId);
  const byOperatorDimension = crossFilter.dimension(d => d.operator);
  const byPartDimension = crossFilter.dimension(d => d.partId);
  const byHourOfDayDimension = crossFilter.dimension(d => d.hourOfDay);

  return {
    update: (newData?) => {
      if (newData) rawData = newData;

      crossFilter.remove();
      crossFilter.add(rawData.filter(filterFn));
      dc.redrawAll();
    },

    resetAll: () => {
      dc.filterAll();
      dc.renderAll();
    },

    byDayDimension: byDayDimension,
    byDayGroup: byDayDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(x => x),

    byMachineDimension: byMachineDimension,
    byMachineGroup: byMachineDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(x => x),

    byOperatorDimension: byOperatorDimension,
    byOperatorGroup: byOperatorDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(x => x),

    byPartDimension: byPartDimension,
    byPartGroup: byPartDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(x => x),
    byHourOfDayDimension: byHourOfDayDimension,
    byHourOfDayGroup: byHourOfDayDimension
      .group()
      .reduce(reduceAdd, reduceRemove, reduceInitial)
      .order(x => x),

  }
}

function removeEmptyBins(sourceGroup) {
  return {
    all: () => sourceGroup.all().filter(d => (d.value !== 0))
  };
}
