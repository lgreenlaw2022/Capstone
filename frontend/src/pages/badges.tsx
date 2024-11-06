import { useState, useEffect } from "react";
import styles from "../styles/Badges.module.css";
import Badge from "@/components/Badge";

import { getBadges } from "@/api/api";

interface Badge {
    id: number;
    title: string;
    description: string;
    type: "concept" | "award";
}

export default function Badges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [conceptBadges, setConceptBadges] = useState<Badge[]>([]);
    const [awardBadges, setAwardBadges] = useState<Badge[]>([]);

    const fetchBadges = async () => {
        try {
            const data = await getBadges();
            // TODO: do I need to keep this?
            setBadges(data);
            // Filter badges by type
            // TODO: see what the type value will be mapped as
            setConceptBadges(
                data.filter((badge: Badge) => badge.type === "concept")
            );
            setAwardBadges(
                data.filter((badge: Badge) => badge.type === "award")
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
                    {conceptBadges.length === 0 && (<p>No badges earned yet. Keep going!</p>)}
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
                    {awardBadges.length === 0 && (<p>No badges earned yet. Keep going!</p>)}
                </div>
                {/* <Badge title="30 day streak" type="award" /> */}
            </div>
        </div>
    );
}
