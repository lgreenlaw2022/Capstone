import { useRouter } from "next/router";
import styles from "../styles/WeeklyReviewCard.module.css";

interface WeeklyReviewCardProps {
    completed: boolean;
}

export default function WeeklyReviewCard({completed}: WeeklyReviewCardProps) {
    const router = useRouter();

    // add an onClick function to send user to quiz
    const handleClick = () => {
        if (!completed) {
            // redirect to quiz
            router.push("/review/weekly");
        }
    };

    return (
        <div className={styles.weeklyCard} onClick={handleClick} role="button">
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
                <h3>Weekly Review</h3>
                {completed ? <p>Completed</p> : <p>Not completed</p>}
            </div>
        </div>
    );
}
