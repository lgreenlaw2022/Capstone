import styles from "../styles/GoalsList.module.css";
import GoalCard from "./GoalCard";
import { Goal } from "@/types/GoalTypes";

interface GoalListProps {
    goals: Goal[];
}

export default function GoalsList({ goals }: GoalListProps) {
    return (
        <div className={styles.goalsList}>
            {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
    );
}
