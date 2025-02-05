import styles from "../styles/GoalCard.module.css";
import ProgressBar from "./ProgressBar";
import { Goal } from "@/types/GoalTypes";

interface GoalCardProps {
    goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
    const completed = goal.completed;

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
            <div className={styles.goalInfo}>
                <h4>{goal.title}</h4>
                <ProgressBar percentage={goal.progressPercentage} />
                <p>
                    {goal.currentValue} / {goal.targetValue}
                </p>
            </div>
        </div>
    );
}
