import { DefectType, QualityResult } from '../../../generated/prisma/enums';

export interface ICreateQualityInspection {
    plantId: string;
    productionLineId: string;

    productName: string;
    batchNumber?: string;

    inspectedQuantity: number;
    passedQuantity: number;
    defectQuantity: number;

    result?: QualityResult;
    defectType?: DefectType;

    notes?: string;

    inspectedById: string;

    inspectionDate?: Date;
}

export interface IUpdateQualityInspection {
    productName?: string;
    batchNumber?: string | null;

    inspectedQuantity?: number;
    passedQuantity?: number;
    defectQuantity?: number;

    result?: QualityResult;
    defectType?: DefectType | null;

    notes?: string | null;

    inspectionDate?: Date;
}

export interface IGetQualityInspectionsQuery {
    plantId?: string;
    productionLineId?: string;
    inspectedById?: string;

    result?: QualityResult;
    defectType?: DefectType;

    startDate?: Date;
    endDate?: Date;
}
