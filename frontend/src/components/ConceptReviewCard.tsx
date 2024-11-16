import { useRouter } from "next/router";
import icons from "../utils/icons";
import styles from "../styles/ConceptReviewCard.module.css";

interface ConceptReviewCardProps {
    unitId: number;
    unitTitle: string;
}

export default function ConceptReviewCard({
    unitId,
    unitTitle,
}: ConceptReviewCardProps) {
    const router = useRouter();
    const iconSrc = icons[unitTitle] || "/assets/award-icons/flame.svg"; // Fallback to a default icon if not found

    console.log("unit title", unitTitle);
    const handleClick = () => {
        router.push(`/review/${unitId}`);
    };

    return (
        <div className={styles.reviewCard} onClick={handleClick}>
            <h4>{unitTitle}</h4>
            <img src={iconSrc} alt={unitTitle} />
        </div>
    );
}
