import CodingChallengeCard from "@/components/CodingChallengeCard";
import { useEffect, useState } from "react";
import { getBonusCodingChallenges } from "@/api/api";

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

    const getChallenges = async () => {
        try {
            const data = await getBonusCodingChallenges();
            setCodingChallenges(data);
        } catch (error) {
            console.error("Error fetching coding challenges:", error);
        }
    };

    // fetch coding reviews
    useEffect(() => {
        // fetch coding challenges
        getChallenges();
    }, []);

    return (
        <div>
            <h3>Bonus Coding Challenges </h3>
            <div>
                <p>Earn gems to unlock bonus code challenges</p>
                {codingChallenges
                    .filter((challenge) => !challenge.completed)
                    .map((challenge) => (
                        <CodingChallengeCard
                            key={challenge.id}
                            module_id={challenge.id}
                            title={challenge.title}
                            unit={challenge.unit_title}
                            open={challenge.open}
                            completed={challenge.completed}
                        />
                    ))}
                {/* <CodingChallengeCard /> */}
            </div>
            <div>
                <h4>Completed</h4>
                {codingChallenges
                    .filter((challenge) => challenge.completed)
                    .map((challenge) => (
                        <CodingChallengeCard
                            key={challenge.id}
                            module_id={challenge.id}
                            title={challenge.title}
                            unit={challenge.unit_title}
                            open={challenge.open}
                            completed={challenge.completed}
                        />
                    ))}
                {/* <CodingChallengeCard /> */}
            </div>
        </div>
    );
}
