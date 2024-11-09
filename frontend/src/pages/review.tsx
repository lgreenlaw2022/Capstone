import WeeklyReviewCard from '@/components/WeeklyReviewCard'
import styles from '../styles/Review.module.css'
import ConceptReviewCard from '@/components/ConceptReviewCard'

export default function Review() {
    return (
        <div className={styles.reviewContainer}>
            <h1>Review</h1>
            <WeeklyReviewCard />
            <div>
                <h3>Concept Review</h3>
                <ConceptReviewCard />
            </div>
            <div>
                <h3>Bonus Coding Challenges </h3>
                <p>Earn gems to unlock bonus code challenges</p>
                <h4>Completed</h4>
            </div>
        </div>
    )
}