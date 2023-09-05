import * as _ from "lodash";
import { IReasonCode, ITask } from "../../../dto";
import { IAppState } from "..";


export const TaskSelector = (state: IAppState) =>
    state.MaterialTask.map(t => {
        let sourceLoc = state.Location.find(l => l.id === t.sourceLocationId) || { name: '<unknown>' };
        let destLoc = state.Location.find(l => l.id === t.destinationLocationId) || { name: '<unknown>' };
        if (t.overrideCode) {
            let overrideCodeReason = state.ReasonCode.find(r => r.codeSet === t.overrideCode.codeSet && r.id === t.overrideCode.reason);
            if (overrideCodeReason) {
                t.overrideCode.name = overrideCodeReason.reason;
            }
        }
        return Object.assign({}, t, { sourceLocation: sourceLoc.name, desinationLocation: destLoc.name });
    })

export const TaskToMagicStateNumberMap = (task: ITask) => {
    // logic pulled from tasks.html
    switch (task.taskState) {
        case 'Ready': return 0;
        case 'Complete': return 2;
        default: return 1;
    }
}

export const GroupByCodeSet = (codes: IReasonCode[]) => {

    const reasonGroups = _(codes).groupBy(c => c.codeSet).value();

    return reasonGroups;
}