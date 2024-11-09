import styles from '../styles/WeeklyReviewCard.module.css'

// decide if completed should be a prop or not 
export default function WeeklyReviewCard() {
    const completed = true;
    return (
        // TODO: conditional styling
        <div className={styles.card}>
            <div className={styles.checkbox}>
                {completed && <img src="/assets/checkmark.svg" height={24} alt="checkbox" />}
                {/* conditional checkbox */}
            </div>
            <div>
                <h2>Weekly Review</h2>
                {/* prop? */}
                {completed ? <p>Completed</p> : <p>Not completed</p>}
            </div>
        </div>
    )
}