export interface IAnalyticsQuery {
    organizationId: string;
    plantId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface IProductionAnalytics {
    totalRecords: number;
    totalTarget: number;
    totalActual: number;
    totalDefects: number;
    totalDowntimeMinutes: number;
    productionEfficiency: number;
    defectRate: number;
}

export interface IMachineAnalytics {
    totalMachines: number;
    onlineMachines: number;
    offlineMachines: number;
    maintenanceMachines: number;
    warningMachines: number;
    criticalMachines: number;
    averageHealthScore: number;
    averageFailureRisk: number;
    highRiskMachines: number;
    criticalRiskMachines: number;
}

export interface IMaintenanceAnalytics {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    cancelledTasks: number;
    completionRate: number;
}

export interface IQualityAnalytics {
    totalInspections: number;
    totalInspectedQuantity: number;
    totalPassedQuantity: number;
    totalDefectQuantity: number;
    passRate: number;
    defectRate: number;
}

export interface IEnergyAnalytics {
    totalRecords: number;
    totalEnergyConsumed: number;
    totalEnergyCost: number;
    averageEnergyConsumed: number;
    averageEnergyCost: number;
}

export interface IAnalyticsOverview {
    production: IProductionAnalytics;
    machines: IMachineAnalytics;
    maintenance: IMaintenanceAnalytics;
    quality: IQualityAnalytics;
    energy: IEnergyAnalytics;
}

export interface IAnalyticsDashboard {
    period: {
        startDate: Date | null;
        endDate: Date | null;
    };

    overview: IAnalyticsOverview;
}
