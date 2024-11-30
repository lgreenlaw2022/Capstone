export interface Goal {
    goalId: number;
    title: string;
    currentValue: number;
    targetValue: number;
    progressPercentage: number;
    timePeriod: string; /* TODO: gonna change this to an enum */
    completed: boolean;
}