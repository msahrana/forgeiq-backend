import { ProductionStatus } from '../../../generated/prisma/enums';

export interface ICreateProductionLine {
    plantId: string;
    name: string;
    code: string;
    description?: string;
    status?: ProductionStatus;
    targetOutput?: number;
}

export interface IUpdateProductionLine {
    name?: string;
    code?: string;
    description?: string | null;
    status?: ProductionStatus;
    targetOutput?: number | null;
}
