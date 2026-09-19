import { PlantStatus } from '../../../generated/prisma/enums';

export interface ICreatePlant {
    organizationId: string;
    managerId?: string;
    name: string;
    code: string;
    location?: string;
    timezone?: string;
    status?: PlantStatus;
}

export interface IUpdatePlant {
    managerId?: string | null;
    name?: string;
    code?: string;
    location?: string | null;
    timezone?: string | null;
    status?: PlantStatus;
}
