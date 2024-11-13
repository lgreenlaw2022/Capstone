import WeeklyReviewCard from '@/components/WeeklyReviewCard'
import styles from '../styles/Review.module.css'
import ConceptReviewCard from '@/components/ConceptReviewCard'
import CodingChallengeReview from '@/components/CodingChallengeReview'

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
                <CodingChallengeReview/>
            </div>
        </div>
    )
}