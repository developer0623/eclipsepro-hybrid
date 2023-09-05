import { IJobSummaryDto } from "../dto"

export declare namespace Sch {
	// TODO: Replace all these with their dto.ts equivalents.
	interface Tooling {
		id: string;
		description: string;
		name: string;
	}
	interface CoilType {
		id: string;
		description: string;
		name: string;
		materialColor: string;
		materialElementType: string;
		materialGauge: string;
		width: string;
	}
	interface Coil {
		id: string;
		serialNumber: string;
		vendor: string;
		startingLength: Number;
		storageLocation: string;
		coilTypeId: string;
	}
	interface JobState {
		id; jobId; completeFt; completionDate;
	}
	interface Machine {
		id; name; isActive;
		machineNumber: number;
	}
	interface AvailableJob {
		id;
		expectedRuntime;
		warningDueDate;
		machineNumber;
		ordId;
		status;
	}
	interface ISequenced {
		id: string;
		sequenceNum: number;
		warningDueDate: boolean;
		warningMaterial: boolean;
		machineId: string;
		jobId: string;
	}
	interface ISchedule {
		machineNumber: number;
		sequence: ISequenced[];
	}
	interface JobDetail {
		id: string;
		orderId: string;
		requiredDate: Date;
		importDate: Date;
		totalFt: Number;
		hold: Boolean;
		customerName: string;
		workOrder: string;
		truckNumber: string;
		stagingBay: string;
		loadingDock: string;
		customerAddress1: string;
		customerAddress2: string;
		customerCity: string;
		customerState: string;
		customerZip: string;
		customerCountry: string;
		customerInstructions: string;
		toolingId: string;
		coilTypeId: string;
		jobStateId: string;
	}
	type PopulatedJob = { tooling: Tooling, coiltype: CoilType, jobState: JobState } & JobDetail
	type AvailableJobDetail = AvailableJob & PopulatedJob
	type ScheduledJobDetail = ISequenced & PopulatedJob
	interface MachineJobsModel {
		AvailableJobs: AvailableJobDetail[]
		ScheduledJobs: ScheduledJobDetail[]
		machineId: number
	}
	interface MachineJobsModel2 {
		AvailableJobs: IJobSummaryDto[];
		ScheduledJobs: IJobSummaryDto[];
		machineId: number;
	}
}
