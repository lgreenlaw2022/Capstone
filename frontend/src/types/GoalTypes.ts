export interface Goal {
    goalId: number;
    title: string;
    currentValue: number;
    targetValue: number;
    progressPercentage: number;
    timePeriod: string;
    completed: boolean;
}

export enum TimePeriodEnum {
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
}

export enum MeasureEnum {
    ModulesCompleted = "complete_modules",
    GemsEarned = "earn_gems",
    ExtendStreak = "extend_streak",
}