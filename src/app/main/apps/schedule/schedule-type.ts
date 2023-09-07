import { RangeValue, IScheduleItem, IJobSummaryDto, ISchedulerGroupSummary } from "../../../core/dto";
export type ExpandedScheduledJob = IScheduleItem &
  IJobSummaryDto & { isSelected: boolean, mainIndex?: number };
export interface IANode {
  jobIds: number[];
  key: string;
  keyColumn: { fieldName: string };
  href?: string;
  srefObj?: {sref: string, param: any};
  ids: number[];
  items: IANode[];
  jobs: ExpandedScheduledJob[];
  warning: boolean;
  warningText: string;
  background: string;
  isSelected: boolean;
  isSummaryRow: boolean;
  summary: ISchedulerGroupSummary;
}
export interface IACell {
  key: string | RangeValue;
  href?: string;
  srefObj?: {sref: string, param: any};
  ids: number[];
  rowspan: number;
  keyColumn: { fieldName: string };
  jobs: ExpandedScheduledJob[];
  isSelected: boolean;
  isSummaryRow: boolean;
  summary: ISchedulerGroupSummary;
}

export interface ICell {
  key: string | RangeValue;
  ids: number[];
  href?: string;
  srefObj?: {sref: string, param: any};
  units: string;
  rowspan: number;
  hold: boolean;
  warning: boolean;
  background: string;
  warningText: string;
  warningColor: string;
  isSelected: boolean;
  isSummaryRow: boolean;
  patternNotDefined: boolean;
  width?: number | undefined;
  summary: ISchedulerGroupSummary;
}
