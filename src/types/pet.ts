// ペット情報の型定義
export type TimestampType =
	| FirebaseFirestore.Timestamp
	| { _seconds: number; _nanoseconds: number }
	| { year: string; month: string; day: string }
	| string
	| null;

export interface VaccineInfo {
	certPhoto?: string;
	date?: TimestampType;
}

export interface PetData {
	petName?: string;
	petBreed?: string;
	size?: string;
	sex?: string;
	rabiesVaccine?: VaccineInfo;
	mixedVaccine?: VaccineInfo;
	[key: string]: unknown;
}

export interface BasePet {
	userId: string;
	petId: string;
	petName: string;
	createdAt: TimestampType;
	petData: PetData;
	applicationId: string;
}

export type PendingPet = BasePet;

export interface ApprovedPet extends BasePet {
	approvedAt: TimestampType;
}

export interface RejectedPet extends BasePet {
	rejectedAt: TimestampType;
	rejectionReason?: string;
}
