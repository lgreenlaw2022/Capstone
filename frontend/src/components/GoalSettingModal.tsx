import { useState } from "react";
import { TimePeriodEnum, MeasureEnum } from "@/types/GoalTypes";
import styles from "@/styles/GoalSettingModal.module.css";

interface GoalSettingModalProps {
    show: boolean;
    onClose: () => void;
    onAddGoal: (
        timePeriod: TimePeriodEnum,
        measure: MeasureEnum,
        goal: number
    ) => void;
}

export default function GoalSettingModal({
    show,
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
    const [isValid, setIsValid] = useState(true);

    if (!show) {
        return null;
    }

    const handleGoalChange = (value: string) => {
        if (/^\d*$/.test(value)) {
            setGoal(value);
            setIsValid(true);
        } else {
            setIsValid(false);
        }
    };

    const getSuggestedRange = () => {
        if (timePeriod === TimePeriodEnum.Daily) {
            if (measure === MeasureEnum.ModulesCompleted) {
                return "Suggested range: 1-20 modules";
            } else if (measure === MeasureEnum.GemsEarned) {
                return "Suggested range: 5-30 gems";
            } else if (measure === MeasureEnum.ExtendStreak) {
                return "Suggested range: 1 day";
            }
        } else if (timePeriod === TimePeriodEnum.Monthly) {
            if (measure === MeasureEnum.ModulesCompleted) {
                return "Suggested range: 20-50 modules";
            } else if (measure === MeasureEnum.GemsEarned) {
                return "Suggested range: 30-100 gems";
            } else if (measure === MeasureEnum.ExtendStreak) {
                return "Suggested range: 2-30 days";
            }
        }
        return "";
    };

    const handleAddGoal = () => {
        console.log("Adding goal", timePeriod, measure, goal);
        onAddGoal(
            timePeriod as TimePeriodEnum,
            measure as MeasureEnum,
            Number(goal)
        );
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Add a Goal</h2>
                <p>
                    You can add personal goals each month to replace the
                    automatic goals. Daily goals will persist for the duration
                    of the month.
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
                                    setTimePeriod(
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
                                    setTimePeriod(
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
                                    setMeasure(e.target.value as MeasureEnum)
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
                                    setMeasure(e.target.value as MeasureEnum)
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
                                    setMeasure(e.target.value as MeasureEnum)
                                }
                            />
                            Modules
                        </label>
                    </div>
                    <div className={styles.optionsContainer}>
                        <p>Goal</p>
                        {/* TODO: put bounds on based on the measure and daily period */}
                        {/* TODO: validate that the entry is a number */}
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={goal}
                            onChange={(e) => handleGoalChange(e.target.value)}
                            placeholder="Enter your goal"
                        />
                        {!isValid && (
                            <p className={styles.warningText}>
                                Please enter a valid number
                            </p>
                        )}
                        <p className={styles.suggestedRange}>{getSuggestedRange()}</p>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    <button type="button" onClick={handleAddGoal}>
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
