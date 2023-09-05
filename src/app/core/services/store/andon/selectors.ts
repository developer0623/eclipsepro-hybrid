import { IAppState } from "..";


// Totally cheating, but machine location names are on the ext, and I don't want to
// solve that problem today.
export const machineLocation = (machineNumber: number) => 'Location/MACH' + machineNumber.toString().padStart(2, '0')

export function selectAndOnDataForMachine(machineNumber: number) {
      return (state: IAppState) => {
            const scheduleSummary = state.MachineScheduleSummary.find(x => x.machineNumber === machineNumber);
            const machineLoc = machineLocation(machineNumber);
            const currentJob = state.JobDetail.find(x => x.ordId === scheduleSummary.currentOrderId);
            const machineState = state.MachineState.find(x => x.machineNumber === machineNumber);
            return ({
                  machineNumber,
                  views: state.AndonViews,
                  metricDefinitions: state.MetricDefinition,
                  machine: state.Machine.find(x => x.machineNumber === machineNumber),
                  scheduleSummary: scheduleSummary,
                  machineState: machineState,
                  shiftStats: state.MachineStatistics.find(x => x.machineNumber === machineNumber),
                  currentJob: currentJob?.job,
                  currentItem: currentJob?.items.find(i => i.itemId === machineState.currentItmId),
                  task: state.MaterialTask.filter(t => t.destinationLocationId === machineLoc).sort((ta, tb) => ta.requiredDate < tb.requiredDate ? -1 : 1)[0] || {}
            });
      };
}
