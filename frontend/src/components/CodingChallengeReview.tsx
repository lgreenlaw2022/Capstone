import CodingChallengeCard from "@/components/CodingChallengeCard";
import { useEffect, useState } from "react";

interface CodingChallenge {
    id: number;
    title: string;
    completed: boolean;
    open: boolean;
}

export default function CodingChallengeReview() {
    const [codingChallenges, setCodingChallenges] = useState<CodingChallenge[]>(
        []
    );

    const getCodingChallenges = async () => {
        try {
            const data = await getCodingChallenges();
            setCodingChallenges(data);
        } catch (error) {
            console.error("Error fetching coding challenges:", error);
        }
    };

    // fetch coding reviews
    useEffect(() => {
        // fetch coding challenges
        getCodingChallenges();
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
                            {...challenge}
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
                            {...challenge}
                        />
                    ))}
                {/* <CodingChallengeCard /> */}
            </div>
        </div>
    );
}
