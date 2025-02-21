import CodingChallengeCard from "@/components/CodingChallengeCard";
import styles from "@/styles/CodingChallengeReview.module.css";
import { useEffect, useState } from "react";
import { getOpenBonusCodingChallenges } from "@/api/api";

interface CodingChallenge {
    id: number;
    title: string;
    unit_title: string;
    completed: boolean;
    open: boolean;
}

export default function CodingChallengeReview() {
    const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>(
        []
    );
    const completedChallenges = codingChallenges.filter(
        (challenge) => challenge.completed
    );
    const incompleteChallenges = codingChallenges.filter(
        (challenge) => !challenge.completed
    );

    const getChallenges = async () => {
        try {
            const data = await getOpenBonusCodingChallenges();
            setCodingChallenges(data);
        } catch (error) {
            console.error("Error fetching coding challenges:", error);
        }
    };

    useEffect(() => {
        getChallenges();
    }, []);

    return (
        <div className={styles.challengesContainer}>
            <h3>Bonus Coding Challenges </h3>
            <div>
                <p>Earn gems to unlock bonus code challenges</p>
                <div className={styles.challengeList}>
                    {incompleteChallenges.length > 0 ? (
                        incompleteChallenges.map((challenge) => (
                            <CodingChallengeCard
                                key={challenge.id}
                                module_id={challenge.id}
                                title={challenge.title}
                                unit={challenge.unit_title}
                            />
                        ))
                    ) : (
                        <p>No incomplete challenges available.</p>
                    )}
                </div>
            </div>
            <div>
                <h4>Completed</h4>
                <div className={styles.challengeList}>
                    {completedChallenges.length > 0 ? (
                        completedChallenges.map((challenge) => (
                            <CodingChallengeCard
                                key={challenge.id}
                                module_id={challenge.id}
                                title={challenge.title}
                                unit={challenge.unit_title}
                            />
                        ))
                    ) : (
                        <p>No completed challenges yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
