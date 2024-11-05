import React from "react";
import badgeIcons from "../utils/badgeIcons";
import styles from "../styles/Badge.module.css";

interface BadgeProps {
    title: string;
    // TODO: make this an enum?
    type: "concept" | "award";
}

const Badge: React.FC<BadgeProps> = ({ title, type }) => {
    const iconSrc = badgeIcons[title] || "/assets/award-icons/flame.svg"; // Fallback to a default icon if not found
    const badgeClass =
        type === "concept" ? styles.conceptBadge : styles.awardBadge;

    return (
        <div className={badgeClass}>
            <div className={styles.badgeText}>
                {type === "concept" && <p>Completed Unit</p>}
                <h3>{title}</h3>
            </div>
            <img src={iconSrc} alt={title} />
        </div>
    );
};

export default Badge;
