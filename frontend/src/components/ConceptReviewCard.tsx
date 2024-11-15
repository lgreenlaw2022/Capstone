import { useRouter } from 'next/router'
import styles from '../styles/ConceptReviewCard.module.css'

interface ConceptReviewCardProps {
    unitId: number;
    unitTitle: string;
}

export default function ConceptReviewCard({unitId, unitTitle}: ConceptReviewCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/review/${unitId}`)
    };

    return (
        <div className={styles.reviewCard} onClick={handleClick}>
            <h4>{unitTitle}</h4>
            {/* TODO: make icon dynamic */}
            <img src="/assets/unit-icons/hashmaps.svg" alt="unit icon" />
        </div>
    )
}