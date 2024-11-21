import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";

export default function Goals() {
    return (
        <div className={styles.goalsContainer}>
            <div>
                <div>
                    <h2>Daily Goals</h2>
                    <GoalsList />
                </div>
                <div>
                    <h2>Monthly Goals</h2>
                    <GoalsList />
                </div>
            </div>
            <div>
                <h2>Weekly gift</h2>
                <h2>Activity Calendar</h2>
            </div>
        </div>
    );
}
