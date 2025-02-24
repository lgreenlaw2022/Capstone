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
    // TODO: making this paid is an issue because I changed the fetch code to use the open tag, which doesn't account for being unlocked
        // I would need to change it to send the ones for the open units and then not open the modules when adding them for the user
    return (
        <div
            className={styles.challengeCard}
            onClick={handleClick}
            role="button"
        >
            <h4>{title}</h4>
            <p>{unit}</p>
        </div>
    );
}
