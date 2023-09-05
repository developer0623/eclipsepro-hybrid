import { IJobSummaryDto, IMaterialDoc } from '../../../core/dto';
type DurationType = 'month' | 'week' | 'day';
type MaterialUsageGroup = {
  key:
  | {
    // Duration: Week
    weekOfYear: number;
    year: number;
  }
  | {
    // Duration: Day
    day: number;
    month: number;
    year: number;
  }
  | {
    // Duration: Month
    month: number;
    year: number;
  };
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc: number;
  records: MaterialUsageRecord[];
};
type MaterialUsageRecord = {
  materialCode: string;
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc?: number | null;
};

type MaterialUsageReportModel = {
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc: number;
  groups: MaterialUsageGroup[];

  request: {
    startDate: string;
    endDate: string;
    duration: 'Day' | 'Month' | 'Year';
  };
};

type CoilSummary = {
  coil: Coil;
  usages: CoilUsagesEntity[];
};
type Coil = {
  documentID: string;
  coilId: string;
  materialCode: string;
  description: string;
  markedComplete: boolean;
  lengthStartFt: number;
  lengthUsedFt: number;
  lengthNonExemptScrapFt: number;
  lengthExemptScrapFt: number;
  lengthOtherAdjustmentsFt: number;
  weightStartLbs: number;
  dateIn: string;
  dateOut?: string | null;
  importDate: string;
  vendorName: string;
  vendorCode: string;
  heatNumber: string;
  purchaseOrder: string;
  user1: string;
  user2: string;
  storeLocation: string;
};
type CoilUsagesEntity = {
  orderCode: string;
  customerName: string;
  machineNumber: number;
  date: string;
  goodFt: number;
  scrapFt: number;
  otherFt: number;
  netChangeFt: number;
};

type FilterState = {
  startDate: Date;
  endDate: Date;
  duration?: DurationType;
  group1?: string;
  group2?: string;
  machines: number[];
};

type CoilScrapReport = {
  coil: Coil;
  material: IMaterialDoc & { documentID: string };
  groups: {
    groupTitle: 'Exempt' | 'Non-Exempt';
    reasons: {
      scrapCode: number;
      scrapReason: string;
      scrapFt: number;
      scrapPct: number;
    }[];
    scrapFt: number;
    scrapPct: number;
  };
};

type OrderSummary = {
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  bundles: {
    bundleIdentity: string;
    prodRuns: {
      coilSerialNumber: string;
      machineNumber: number;
      productionDate: Date;
      shift: number;
      employeeNumber: string;
      items: {
        bundle: number;
        partLengthIn: number;
        punchPartName: string;
        punchOption: string;
        externalItemId: string;
        quantity: number;
        goodFt: number;
        scrapFt: number;
        reclaimedScrapFt: number;
      }[];
    }[];
  }[];
};

type CheckboxMenuItem = {
  name: number;
  //| string; name could also be a string but we are so far only using it for machine numbers
  isChecked: boolean;
};

type QualityAudit = {
  machineNumber: number;
  machineDescription: string;
  productionDate: Date;
  shift: number;
  groups: QualityAuditGroup[];
};

type QualityAuditGroup = {
  key: {
    ordId: number;
    orderCode: string;
    materialCode: string;
    toolingCode: string;
    customerName: string;
  };
  entries: {
    recordDate: Date;
    employeeNumber: string;
    employeeName: string;
    coilSerialNumber: string;
    listId: number;
    listText: string;
    listValue: string;
    listTrigger: number;
  }[];
};
