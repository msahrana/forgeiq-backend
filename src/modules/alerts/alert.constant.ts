export const ALERT_RISK_SCORE = {
    INFO: {
        MIN: 0,
        MAX: 25,
    },

    WARNING: {
        MIN: 26,
        MAX: 50,
    },

    HIGH: {
        MIN: 51,
        MAX: 75,
    },

    CRITICAL: {
        MIN: 76,
        MAX: 100,
    },
} as const;

export const ALERT_TITLE = {
    MACHINE_FAILURE: 'Machine Failure Detected',
    HIGH_TEMPERATURE: 'High Temperature Detected',
    HIGH_VIBRATION: 'High Vibration Detected',
    HIGH_PRESSURE: 'High Pressure Detected',
    LOW_PRESSURE: 'Low Pressure Detected',
    HIGH_POWER: 'High Power Consumption Detected',
    LOW_EFFICIENCY: 'Low Machine Efficiency',
    PRODUCTION_DROP: 'Production Output Dropped',
    QUALITY_ISSUE: 'Quality Issue Detected',
    ENERGY_SPIKE: 'Energy Consumption Spike',
    MAINTENANCE_DUE: 'Machine Maintenance Due',
    SYSTEM: 'System Alert',
} as const;
