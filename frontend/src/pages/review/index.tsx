import WeeklyReviewCard from "@/components/WeeklyReviewCard";
import styles from "../../styles/Review.module.css";
import ConceptReviewCard from "@/components/ConceptReviewCard";
import CodingChallengeReview from "@/components/CodingChallengeReview";
import { UnitData } from "@/types/UnitType";

import { useEffect, useState } from "react";
import { getCompletedUserUnits } from "@/api/api";

export default function Review() {
    const [units, setUnits] = useState<UnitData[]>([]);
    const [weeklyReviewStatus, setWeeklyReviewStatus] = useState(false);

    const getUnits = async () => {
        try {
            const data = await getCompletedUserUnits();
            setUnits(data);
            console.log("Units in prep course:", units);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const getWeeklyReviewStatus = async () => {
        try {
            const data = await getWeeklyReviewStatus();
            // setWeeklyReviewStatus(data);
            console.log("Weekly review status:", data);
        } catch (error) {
            console.error("Error fetching weekly review status:", error);
        }
    };

    useEffect(() => {
        getUnits();
    }, []);

    return (
        <div className={styles.reviewContainer}>
            <h1>Review</h1>
            {/* <WeeklyReviewCard completed={weeklyReviewStatus}/> */}
            <div>
                <h3>Concept Review</h3>
                {units.length === 0 && <p>No units to review</p>}
                {units.map((unit, index) => (
                    // TODO: decide what props I want to pass to ConceptReviewCard
                    <ConceptReviewCard key={index} unitId={unit.id} unitTitle={unit.title} />
                ))}
            </div>
            <div>
                {/* <CodingChallengeReview /> */}
            </div>
        </div>
    );
}
