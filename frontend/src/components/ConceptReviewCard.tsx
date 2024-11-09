import styles from '../styles/ConceptReviewCard.module.css'

export default function ConceptReviewCard() {
    return (
        <div className={styles.reviewCard}>
            <h4>Unit title</h4>
            <img src="/assets/unit-icons/hashmaps.svg" alt="unit icon" />
        </div>
    )
}