import { Prisma } from '../../../generated/prisma/client';
import { ReportStatus, ReportType } from '../../../generated/prisma/enums';

export interface ICreateReport {
    organizationId: string;
    plantId?: string;
    type: ReportType;
    title: string;
    dateFrom: Date;
    dateTo: Date;
    status?: ReportStatus;
    fileUrl?: string;
    metadata?: Prisma.InputJsonValue;
}

export interface IUpdateReport {
    plantId?: string | null;
    type?: ReportType;
    title?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: ReportStatus;
    fileUrl?: string | null;
    metadata?: Prisma.InputJsonValue | null;
}

export interface IGetReportsQuery {
    organizationId?: string;
    plantId?: string;
    type?: ReportType;
    status?: ReportStatus;
    startDate?: Date;
    endDate?: Date;
}
