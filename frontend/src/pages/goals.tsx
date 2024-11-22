import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";
import WeeklyGift from "@/components/WeeklyGift";

export default function Goals() {
    return (
        <div className={styles.goalsContainer}>
            <div className={styles.containerRow}>
                <div>
                    <h2>Daily Goals</h2>
                    <GoalsList />
                </div>
                <WeeklyGift/>
            </div>
            <div className={styles.containerRow}>
                <div>
                    <h2>Monthly Goals</h2>
                    <GoalsList />
                </div>
                <h2>Calendar</h2>
            </div>
        </div>
    );
}
