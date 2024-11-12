import React from "react";
import badgeIcons from "../utils/badgeIcons";
import styles from "../styles/Badge.module.css";
import { BadgeType } from "../types/BadgeTypes";

interface BadgeProps {
    title: string;
    type: BadgeType;
}

const Badge: React.FC<BadgeProps> = ({ title, type }) => {
    const iconSrc = badgeIcons[title] || "/assets/award-icons/flame.svg"; // Fallback to a default icon if not found
    const badgeClass =
        type === BadgeType.CONTENT ? styles.conceptBadge : styles.awardBadge;

    return (
        <div className={badgeClass}>
            <div className={styles.badgeText}>
                {type === BadgeType.CONTENT && <p>Completed Unit</p>}
                <h3>{title}</h3>
            </div>
            <img src={iconSrc} alt={title} />
        </div>
    );
};

export default Badge;
