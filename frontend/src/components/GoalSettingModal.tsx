import { useState, useEffect } from "react";
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

    // TODO: possible optimization and refactoring here
    const getSuggestedRangeLimits = (): [number, number] => {
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
                return [20, 50];
            } else if (measure === MeasureEnum.GemsEarned) {
                return [30, 100];
            } else if (measure === MeasureEnum.ExtendStreak) {
                // TODO: small issue if its 28 or 31 days in the month
                return [2, 31];
            }
        }
        return [0, Infinity];
    };

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
        const [min, max] = getSuggestedRangeLimits();
        if (numericValue < min || numericValue > max) {
            setIsValid(false);
            setErrorMessage(`Value must be between ${min} and ${max}`);
            return;
        }

        setIsValid(true);
    };

    const handleGoalChange = (value: string) => {
        setGoal(value);
        setIsDirty(true);
    };

    const handleTimePeriodChange = (value: TimePeriodEnum) => {
        setTimePeriod(value);
        if (isDirty) {
            validateGoal(goal);
        }
    };

    const handleMeasureChange = (value: MeasureEnum) => {
        setMeasure(value);
        if (isDirty) {
            validateGoal(goal);
        }
    };

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
            console.log("Adding goal", timePeriod, measure, goal);
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
