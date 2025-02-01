import { useState } from "react";

import styles from "@/styles/GoalSettingModal.module.css";

interface GoalSettingModalProps {
    show: boolean;
}

export default function GoalSettingModal({ show }: GoalSettingModalProps) {
    const [timePeriod, setTimePeriod] = useState<string>('');
    const [measure, setMeasure] = useState<string>('');
    const [goal, setGoal] = useState<string>('');


    if (!show) {
        return null;
    }
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Add a Goal</h2>
                <p>
                    You can add personal goals each month to replace the
                    automatic goals. Daily goals will persist for the duration
                    of the month.
                </p>
                <div className={styles.optionsContainer}>
                    <p>Time Period</p>
                    <label className={styles.radioButton}>
                        <input
                            type="radio"
                            name="timePeriod"
                            value="Month"
                            checked={timePeriod === 'Month'}
                            onChange={(e) => setTimePeriod(e.target.value)}
                        />
                        Month
                    </label>
                    <label className={styles.radioButton}>
                        <input
                            type="radio"
                            name="timePeriod"
                            value="Day"
                            checked={timePeriod === 'Day'}
                            onChange={(e) => setTimePeriod(e.target.value)}
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
                            value="Goals completed"
                            checked={measure === 'Goals completed'}
                            onChange={(e) => setMeasure(e.target.value)}
                        />
                        Goals completed
                    </label>
                    <label className={styles.radioButton}>
                        <input
                            type="radio"
                            name="measure"
                            value="XP earned"
                            checked={measure === 'XP earned'}
                            onChange={(e) => setMeasure(e.target.value)}
                        />
                        XP earned
                    </label>
                    <label className={styles.radioButton}>
                        <input
                            type="radio"
                            name="measure"
                            value="Modules completed"
                            checked={measure === 'Modules completed'}
                            onChange={(e) => setMeasure(e.target.value)}
                        />
                        Modules completed
                    </label>
                </div>
                <div className={styles.optionsContainer}>
                    <p>Goal</p>
                    {/* TODO: put bounds on based on the measure and daily period */}
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Enter your goal"
                    />
                </div>
                <div>
                    <button type="button">Add</button>
                    <button type="button">Cancel</button>
                </div>
            </div>
        </div>
    );
}
