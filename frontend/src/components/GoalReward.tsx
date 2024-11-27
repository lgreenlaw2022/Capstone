import styles from "../styles/GoalReward.module.css";
import { Goal } from "../types/GoalTypes";
import Image from "next/image";
import openGift from "../../public/assets/open-gem-gift.svg";
import { addGoalReward } from "@/api/api";

interface GoalProps {
    goal: Goal;
    onContinue: (goalId: number) => void;
}

export default function GoalReward({ goal, onContinue }: GoalProps) {
    const handleContinue = async () => {
        await addGoalReward(goal.goalId);
        onContinue(goal.goalId);
    };

    return (
        // TODO: decide if I want goal specific messaging
        <>
            <div className={styles.overlay}></div>
            <div className={styles.rewardContainer}>
                <h2>Good Work!</h2>
                <Image
                    src={openGift}
                    alt="gem gift box"
                    width={118}
                    height={118}
                />
                <p>You earned 20 gems</p>
                <button onClick={handleContinue} className={styles.text}>
                    Keep it Going!
                </button>
            </div>
        </>
    );
}
