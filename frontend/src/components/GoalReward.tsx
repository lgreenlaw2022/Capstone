import { useState } from "react";
import styles from "../styles/Reward.module.css";
import { Goal } from "../types/GoalTypes";
import Image from "next/image";
import openGift from "../../public/assets/open-gem-gift.svg";
import { addGoalReward } from "@/api/api";

interface GoalProps {
    goal: Goal;
    onContinue: (goalId: number) => void;
}

export default function GoalReward({ goal, onContinue }: GoalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleContinue = async () => {
        // Check if already processing to prevent multiple requests
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await addGoalReward(goal.goalId);
            onContinue(goal.goalId);
        }
        finally {
            setIsProcessing(false);
        }
    };

    return (    
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
                <div>
                    <p>{goal.title}</p>
                    <p>You earned 5 gems</p>
                </div>
                <button onClick={handleContinue} className={styles.text} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Keep it Going!"}
                </button>
            </div>
        </>
    );
}
