import styles from "../styles/GoalCard.module.css";
import ProgressBar from "./ProgressBar";

export default function GoalCard() {
    const completed = true;

    return (
        <div className={styles.goalCard}>
            <div className={styles.checkbox}>
                {completed && (
                    <img
                        src="/assets/checkmark.svg"
                        height={24}
                        alt="checkbox"
                    />
                )}
            </div>
            <div>
                <h4>Complete a module 7 days in a row</h4>
                <ProgressBar percentage={25}/>
                <p>numerical progress</p>
            </div>
        </div>
    )
}