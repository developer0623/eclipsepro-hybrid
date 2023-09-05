import { IJobSummaryDto, IMaterialDoc } from '../../../core/dto';
export type DurationType = 'month' | 'week' | 'day';
export type MaterialUsageGroup = {
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
export type MaterialUsageRecord = {
  materialCode: string;
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc?: number | null;
};

export type MaterialUsageReportModel = {
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

export type ToolingUsageGroup = {
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
  records: ToolingUsageRecord[];
};
export type ToolingUsageRecord = {
  toolingCode: string;
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc?: number | null;
};

export type ToolingUsageReportModel = {
  lengthUsedFt: number;
  lengthScrapFt: number;
  scrapPerc: number;
  groups: ToolingUsageGroup[];

  request: {
    startDate: string;
    endDate: string;
    duration: 'Day' | 'Month' | 'Year';
  };
};

export type CoilSummary = {
  coil: Coil;
  usages: CoilUsagesEntity[];
};
export type Coil = {
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
export type CoilUsagesEntity = {
  orderCode: string;
  customerName: string;
  machineNumber: number;
  date: string;
  goodFt: number;
  scrapFt: number;
  otherFt: number;
  netChangeFt: number;
};

export type FilterState = {
  startDate: Date;
  endDate: Date;
  duration?: DurationType;
  group1?: string;
  group2?: string;
  machines?: number[];
  shifts?: number[];
  scheduleStatus?: string;
};

export type CoilScrapReport = {
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

export type OrderSummary = {
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

export type OrderSequence = {
  bundles: {
    bundle: number;
    bundleId: number;
    changeId: number;
    user1: null | string;
    user2: null | string;
    user3: null | string;
    user4: null | string;
    user5: null | string;
  }[];
  documentID: string;
  id: string;
  items: {
    bundle: number;
    bundleCode: string;
    calculateLengthFromHole: boolean;
    doneDate: string;
    externalItemId: string;
    holeCount: number;
    itemId: number;
    lengthIn: number;
    messageText: string;
    option: null;
    patternId: string;
    patternName: string;
    patternNotDefined: boolean;
    patternNumber: number;
    pieceMark: string;
    quantity: number;
    quantityDone: number;
    sequence: number;
    stagger: boolean;
    targetRate: number;
    user1: string;
    user2: string;
    user3: string;
    user4: string;
    user5: string;
    weightLbs: number;
  }[];
  job: IJobSummaryDto;
  ordId: number;
  materialGroup?: {
    accFt: number;
    accLbs: number;
    accCount: number;
    accLast: boolean;
  }
};

export type CheckboxMenuItem = {
  name: number;
  //| string; name could also be a string but we are so far only using it for machine numbers
  isChecked: boolean;
};

export type QualityAudit = {
  machineNumber: number;
  machineDescription: string;
  productionDate: Date;
  shift: number;
  groups: QualityAuditGroup[];
};

export type QualityAuditGroup = {
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
