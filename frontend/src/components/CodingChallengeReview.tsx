import CodingChallengeCard from "@/components/CodingChallengeCard";

export default function CodingChallengeReview() {
    return (
        <div>
            <h3>Bonus Coding Challenges </h3>
            <div>
                <p>Earn gems to unlock bonus code challenges</p>
                <CodingChallengeCard />
            </div>
            <div>
                <h4>Completed</h4>
                <CodingChallengeCard/>
            </div>
        </div>
    );
}
