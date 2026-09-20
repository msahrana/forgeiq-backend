export const MACHINE_METRIC_LIMITS = {
    TEMPERATURE: {
        MIN: -100,
        MAX: 1000,
    },

    VIBRATION: {
        MIN: 0,
        MAX: 1000,
    },

    PRESSURE: {
        MIN: 0,
        MAX: 10000,
    },

    RPM: {
        MIN: 0,
        MAX: 100000,
    },

    POWER_CONSUMPTION: {
        MIN: 0,
        MAX: 100000,
    },

    LOAD_PERCENTAGE: {
        MIN: 0,
        MAX: 100,
    },
} as const;
