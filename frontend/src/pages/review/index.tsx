import WeeklyReviewCard from "@/components/WeeklyReviewCard";
import styles from "../../styles/Review.module.css";
import ConceptReviewCard from "@/components/ConceptReviewCard";
import CodingChallengeReview from "@/components/CodingChallengeReview";
import { UnitData } from "@/types/UnitType";

import { useEffect, useState } from "react";
import { getCompletedUserUnits, getWeeklyReviewStatus } from "@/api/api";

export default function Review() {
    const [units, setUnits] = useState<UnitData[]>([]);
    const [weeklyReviewStatus, setWeeklyReviewStatus] = useState(false);

    const fetchData = async () => {
        try {
            const [unitsData, statusData] = await Promise.all([
                getCompletedUserUnits(),
                getWeeklyReviewStatus(),
            ]);
            setUnits(unitsData);
            setWeeklyReviewStatus(statusData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={styles.reviewContainer}>
            <h1>Review</h1>
            <WeeklyReviewCard completed={weeklyReviewStatus} />
            <div>
                <h3>Concept Review</h3>
                {units.length === 0 && <p>No units to review</p>}
                {units.map((unit, index) => (
                    <ConceptReviewCard
                        key={unit.id}
                        unitId={unit.id}
                        unitTitle={unit.title}
                    />
                ))}
            </div>
            <CodingChallengeReview />
        </div>
    );
}
