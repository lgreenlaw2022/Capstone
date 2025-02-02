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
    const [goal, setGoal] = useState<number>(0);

    if (!show) {
        return null;
    }

    const handleAddGoal = () => {
        console.log("Adding goal", timePeriod, measure, goal);
        onAddGoal(timePeriod as TimePeriodEnum, measure as MeasureEnum, goal);
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
                        {/* TODO: the fuck happened here, why can't I type myself */}
                        <input
                            type="number"
                            value={goal}
                            onChange={(e) => setGoal(Number(e.target.value))}
                            placeholder="Enter your goal"
                        />
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
