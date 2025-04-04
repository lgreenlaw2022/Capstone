import { useState, useEffect } from "react";
import styles from "../styles/Badges.module.css";
import Badge from "@/components/Badge";
import {
    Badge as BadgeType,
    BadgeType as BadgeEnum,
    mapBadgeType,
} from "../types/BadgeTypes";

import { getBadges } from "@/api/api";
import Loading from "@/components/Loading";

export default function Badges() {
    const [conceptBadges, setConceptBadges] = useState<BadgeType[]>([]);
    const [awardBadges, setAwardBadges] = useState<BadgeType[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    // Fetch badges on component mount
    useEffect(() => {
        setLoading(true);
        fetchBadges();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.badgesContainer}>
            <h2>Badges</h2>
            {/* Unit completion badges */}
            <div className={styles.typeGroup}>
                <h3>Concepts</h3>
                <div className={styles.badgeGroup}>
                    {conceptBadges.map((badge) => (
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
            {/* Award badges */}
            <div className={styles.typeGroup}>
                <h3>Awards</h3>
                <div className={styles.badgeGroup}>
                    {awardBadges.map((badge) => (
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
