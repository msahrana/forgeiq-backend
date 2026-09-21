import {
    AIInsightSeverity,
    AIInsightType,
} from '../../../generated/prisma/enums';

import { Prisma } from '../../../generated/prisma/client';

export interface ICreateAIInsight {
    organizationId: string;
    plantId?: string;
    type: AIInsightType;
    severity: AIInsightSeverity;
    title: string;
    message: string;
    recommendation?: string;
    metadata?: Prisma.InputJsonValue;
}

export interface IUpdateAIInsight {
    severity?: AIInsightSeverity;
    title?: string;
    message?: string;
    recommendation?: string | null;
    metadata?: Prisma.InputJsonValue | null;
    isResolved?: boolean;
    resolvedAt?: Date | null;
}

export interface IGetAIInsightsQuery {
    organizationId: string;
    plantId?: string;
    type?: AIInsightType;
    severity?: AIInsightSeverity;
    isResolved?: boolean;
    startDate?: Date;
    endDate?: Date;
}
