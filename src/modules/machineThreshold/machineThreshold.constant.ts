export const MACHINE_THRESHOLD_LIMITS = {
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

    POWER: {
        MIN: 0,
        MAX: 100000,
    },
} as const;
