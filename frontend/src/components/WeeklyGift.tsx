import Image from "next/image";
import giftLarge from "../../public/assets/gift-large.svg";
import styles from "../styles/WeeklyGift.module.css";
import ProgressBar from "./ProgressBar";
import { useEffect, useState } from "react";
import {
    addWeeklyCompletionGoalGems,
    getNumGoalsCompletedThisWeek,
} from "@/api/api";
import Reward from "./Reward";

export default function WeeklyGift() {
    const [numGoalsCompleted, setNumGoalsCompleted] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [showReward, setShowReward] = useState(false);

    const fetchData = async () => {
        const data = await getNumGoalsCompletedThisWeek();
        setNumGoalsCompleted(data);
        // TODO: not an ideal trigger
        if (numGoalsCompleted == 7) {
            setShowReward(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRewardContinue = async () => {
        await addWeeklyCompletionGoalGems();
        setShowReward(false);
    };

    useEffect(() => {
        setPercentage(
            numGoalsCompleted > 0 ? (numGoalsCompleted / 7) * 100 : 0
        );
    }, [numGoalsCompleted]);

    return (
        <div className={styles.weeklyGiftContainer}>
            {showReward && (
                <Reward
                    title="You've completed the weekly goal!"
                    gems={10}
                    onContinue={handleRewardContinue}
                />
            )}
            <h2>Weekly Gift</h2>
            <div className="weeklyGiftImage">
                <Image src={giftLarge} alt="gift box" width={87} height={82} />
            </div>
            <div className="weeklyGiftDescription">
                {/* TODO: will this be dynamic? -- not for MVP*/}
                <p>Complete 7 goals</p>
                <div>
                    <div>
                        <ProgressBar percentage={percentage} />
                    </div>
                    <p>{numGoalsCompleted} / 7</p>
                </div>
            </div>
        </div>
    );
}
