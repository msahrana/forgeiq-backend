import { Prisma } from '../../../generated/prisma/client';

import {
    AlertSeverity,
    AlertStatus,
    AlertType,
} from '../../../generated/prisma/enums';

export interface ICreateAlert {
    plantId: string;
    machineId?: string;

    type: AlertType;
    severity: AlertSeverity;
    status?: AlertStatus;

    title: string;
    message: string;

    riskScore?: number;

    metadata?: Prisma.InputJsonValue;
}

export interface IUpdateAlert {
    type?: AlertType;
    severity?: AlertSeverity;
    status?: AlertStatus;

    title?: string;
    message?: string;

    riskScore?: number;

    metadata?: Prisma.InputJsonValue | null;
}

export interface IAcknowledgeAlert {
    acknowledgedById: string;
}

export interface IResolveAlert {
    resolvedById: string;
}

export interface IDismissAlert {
    reason?: string;
}
