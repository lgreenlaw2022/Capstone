import { useRouter } from 'next/router';
import styles from '../styles/CodingChallengeCard.module.css'

interface CodingChallengeCardProps {
    module_id: number;
    title: string;
    unit: string;
    completed: boolean;
}

export default function ConceptReviewCard({ module_id, title, unit, completed }: CodingChallengeCardProps) {
    const router = useRouter()

    const handleClick = () => {
        if (!completed) {
            router.push(`/learn/challenge/${module_id}`)
        }
    };
    // TODO: conditional styling for completed challenges?
    return (
        <div className={styles.card} onClick={handleClick}>
            <h4>{title}</h4>
            <p>{unit}</p>
        </div>
    )
}