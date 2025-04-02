import { useState, useEffect, useCallback } from "react";
import { TimePeriodEnum, MeasureEnum } from "@/types/GoalTypes";
import styles from "@/styles/GoalSettingModal.module.css";

interface GoalSettingModalProps {
    onClose: () => void;
    onAddGoal: (
        timePeriod: TimePeriodEnum,
        measure: MeasureEnum,
        goal: number
    ) => void;
}

const getSuggestedRangeLimits = (
    timePeriod: TimePeriodEnum,
    measure: MeasureEnum
): [number, number] => {
    if (timePeriod === TimePeriodEnum.Daily) {
        if (measure === MeasureEnum.ModulesCompleted) {
            return [1, 20];
        } else if (measure === MeasureEnum.GemsEarned) {
            return [5, 30];
        } else if (measure === MeasureEnum.ExtendStreak) {
            return [1, 1];
        }
    } else if (timePeriod === TimePeriodEnum.Monthly) {
        if (measure === MeasureEnum.ModulesCompleted) {
            return [15, 50];
        } else if (measure === MeasureEnum.GemsEarned) {
            return [30, 100];
        } else if (measure === MeasureEnum.ExtendStreak) {
            return [5, 30];
        }
    }
    return [0, Number.POSITIVE_INFINITY];
};

export default function GoalSettingModal({
    onClose,
    onAddGoal,
}: GoalSettingModalProps) {
    const [timePeriod, setTimePeriod] = useState<TimePeriodEnum>(
        TimePeriodEnum.Monthly
    );
    const [measure, setMeasure] = useState<MeasureEnum>(
        MeasureEnum.ExtendStreak
    );
    const [goal, setGoal] = useState<string>("");
    const [isValid, setIsValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDirty, setIsDirty] = useState(false);

    const validateGoal = (value: string) => {
        if (value === "") {
            setIsValid(false);
            setErrorMessage("Please enter a goal");
            return;
        }
        if (!/^\d*$/.test(value)) {
            setIsValid(false);
            setErrorMessage("Please enter a valid number");
            return;
        }

        const numericValue = Number(value);
        const [min, max] = getSuggestedRangeLimits(timePeriod, measure);
        if (numericValue < min || numericValue > max) {
            setIsValid(false);
            setErrorMessage(`Value must be between ${min} and ${max}`);
            return;
        }

        setIsValid(true);
    };

    const handleGoalChange = useCallback((value: string) => {
        setGoal(value);
        setIsDirty(true);
    }, []);

    const handleTimePeriodChange = useCallback(
        (value: TimePeriodEnum) => {
            setTimePeriod(value);
            if (isDirty) {
                validateGoal(goal);
            }
        },
        [goal, isDirty]
    );

    const handleMeasureChange = useCallback(
        (value: MeasureEnum) => {
            setMeasure(value);
            if (isDirty) {
                validateGoal(goal);
            }
        },
        [goal, isDirty]
    );

    useEffect(() => {
        validateGoal(goal);
    }, [goal, timePeriod, measure, isDirty]);

    const handleAddGoal = () => {
        if (!isDirty) {
            setIsDirty(true);
            validateGoal(goal);
            return;
        }
        if (isValid) {
            onAddGoal(
                timePeriod as TimePeriodEnum,
                measure as MeasureEnum,
                Number(goal)
            );
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Add a Goal</h2>
                <p>
                    Set personal goals in the first week of each month to
                    replace automatic ones. Daily goals persist for the month,
                    and your existing progress is preserved.
                </p>
                <div>
                    <div className={styles.optionsContainer}>
                        <p>Time Period</p>
                        <label className={styles.radioButton}>
                            <input
                                type="radio"
                                name="timePeriod"
                                value={TimePeriodEnum.Monthly}
                                checked={timePeriod === TimePeriodEnum.Monthly}
                                onChange={(e) =>
                                    handleTimePeriodChange(
                                        e.target.value as TimePeriodEnum
                                    )
                                }
                            />
                            Month
                        </label>
                        <label className={styles.radioButton}>
                            <input
                                type="radio"
                                name="timePeriod"
                                value={TimePeriodEnum.Daily}
                                checked={timePeriod === TimePeriodEnum.Daily}
                                onChange={(e) =>
                                    handleTimePeriodChange(
                                        e.target.value as TimePeriodEnum
                                    )
                                }
                            />
                            Day
                        </label>
                    </div>
                    <div className={styles.optionsContainer}>
                        <p>Measure</p>
                        <label className={styles.radioButton}>
                            <input
                                type="radio"
                                name="measure"
                                value={MeasureEnum.ExtendStreak}
                                checked={measure === MeasureEnum.ExtendStreak}
                                onChange={(e) =>
                                    handleMeasureChange(
                                        e.target.value as MeasureEnum
                                    )
                                }
                            />
                            Days Practiced
                        </label>
                        <label className={styles.radioButton}>
                            <input
                                type="radio"
                                name="measure"
                                value={MeasureEnum.GemsEarned}
                                checked={measure === MeasureEnum.GemsEarned}
                                onChange={(e) =>
                                    handleMeasureChange(
                                        e.target.value as MeasureEnum
                                    )
                                }
                            />
                            Gems
                        </label>
                        <label className={styles.radioButton}>
                            <input
                                type="radio"
                                name="measure"
                                value={MeasureEnum.ModulesCompleted}
                                checked={
                                    measure === MeasureEnum.ModulesCompleted
                                }
                                onChange={(e) =>
                                    handleMeasureChange(
                                        e.target.value as MeasureEnum
                                    )
                                }
                            />
                            Modules
                        </label>
                    </div>
                    <div className={styles.optionsContainer}>
                        <p>Goal</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={goal}
                            onChange={(e) => handleGoalChange(e.target.value)}
                            placeholder="Enter your goal"
                            aria-label="Enter numeric goal value"
                        />
                        {!isValid && isDirty && (
                            <p className={styles.warningText}>{errorMessage}</p>
                        )}
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={handleAddGoal}
                        disabled={!isValid || !isDirty}
                    >
                        Add
                    </button>
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
