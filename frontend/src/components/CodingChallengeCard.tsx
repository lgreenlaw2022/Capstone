import styles from '../styles/CodingChallengeCard.module.css'

interface CodingChallengeCardProps {
    module_id: number;
    title: string;
    unit: string;
    open: boolean;
    completed: boolean;
}

export default function ConceptReviewCard({ module_id, title, unit, open, completed }: CodingChallengeCardProps) {

    // need to split by open and completed
    return (
        <div className={styles.card}>
            <h4>{title}</h4>
            <p>{unit}</p>
        </div>
    )
}