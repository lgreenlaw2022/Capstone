import { useRouter } from "next/router";
import styles from "../styles/CodingChallengeCard.module.css";

interface CodingChallengeCardProps {
    module_id: number;
    title: string;
    unit: string;
}

export default function ConceptReviewCard({
    module_id,
    title,
    unit,
}: CodingChallengeCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/learn/challenge/${module_id}`);
    };
    return (
        <div className={styles.challengeCard} onClick={handleClick}>
            <h4>{title}</h4>
            <p>{unit}</p>
        </div>
    );
}
