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
    const [badges, setBadges] = useState<BadgeType[]>([]);
    const [conceptBadges, setConceptBadges] = useState<BadgeType[]>([]);
    const [awardBadges, setAwardBadges] = useState<BadgeType[]>([]);

    const fetchBadges = async () => {
        try {
            const data = await getBadges();
            const mappedData = data.map((badge: any) => ({
                ...badge,
                type: mapBadgeType(badge.type),
            }));
            setBadges(mappedData);
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
        <div className={styles.badgeContainer}>
            <h2>Badges</h2>
            {/* TODO: conditional badge styling for locked or unlocked? maybe not worth it at this MVP */}
            <div className={styles.badgeGroup}>
                <h3>Concepts</h3>
                <div>
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
                {/* TODO: see what the type value will be mapped as */}
                {/* <Badge title="Hash Tables" type="concept" /> */}
            </div>
            <div className={styles.badgeGroup}>
                <h3>Awards</h3>
                <div>
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
                {/* <Badge title="30 day streak" type="award" /> */}
            </div>
        </div>
    );
}
