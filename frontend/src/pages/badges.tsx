import { useState, useEffect } from "react";
import styles from "../styles/Badges.module.css";
import Badge from "@/components/Badge";
import {
    Badge as BadgeType,
    BadgeType as BadgeEnum,
    mapBadgeType,
} from "../types/BadgeTypes";

import { getBadges } from "@/api/api";

export default function Badges() {
    const [conceptBadges, setConceptBadges] = useState<BadgeType[]>([]);
    const [awardBadges, setAwardBadges] = useState<BadgeType[]>([]);

    const fetchBadges = async () => {
        try {
            const data = await getBadges();
            const mappedData = data.map((badge: BadgeType) => ({
                ...badge,
                type: mapBadgeType(badge.type),
            }));
            setConceptBadges(
                mappedData.filter(
                    (badge: BadgeType) => badge.type === BadgeEnum.CONTENT
                )
            );
            setAwardBadges(
                mappedData.filter(
                    (badge: BadgeType) => badge.type === BadgeEnum.AWARD
                )
            );
        } catch (error) {
            console.error("Error fetching badges:", error);
        }
    };

    // Fetch badges on component mount
    useEffect(() => {
        fetchBadges();
    }, []);

    return (
        <div className={styles.badgesContainer}>
            <h2>Badges</h2>
            <div className={styles.typeGroup}>
                <h3>Concepts</h3>
                <div className={styles.badgeGroup}>
                    {conceptBadges.map((badge, index) => (
                        <Badge
                            key={badge.id}
                            title={badge.title}
                            type={badge.type}
                        />
                    ))}
                    {conceptBadges.length === 0 && (
                        <p>No badges earned yet. Keep going!</p>
                    )}
                </div>
            </div>
            <div className={styles.typeGroup}>
                <h3>Awards</h3>
                <div className={styles.badgeGroup}>
                    {awardBadges.map((badge, index) => (
                        <Badge
                            key={badge.id}
                            title={badge.title}
                            type={badge.type}
                        />
                    ))}
                    {awardBadges.length === 0 && (
                        <p>No badges earned yet. Keep going!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
