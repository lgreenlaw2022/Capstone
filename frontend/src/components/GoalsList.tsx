import styles from "../styles/GoalsList.module.css";
import GoalCard from "./GoalCard";

export default function GoalsList() {

    return (
        <div className={styles.goalsList}>
            <GoalCard/>
            {/* <span className={styles.line}/> */}
            <p> List item 2</p>
            <p> List item 3</p>
        </div>
    )
}