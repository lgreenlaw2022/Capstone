export interface Goal {
    goalId: number;
    title: string;
    currentValue: string;
    targetValue: string;
    progressPercentage: number;
    timePeriod: string; /* TODO: gonna change this to an enum */
    completed: boolean;
}