import styles from "../styles/Reward.module.css";
import Image from "next/image";
import openGift from "../../public/assets/open-gem-gift.svg";

interface LeaderboardRewardProps {
    gems: number;
    onContinue: () => void;
}

export default function LeaderboardReward({ gems, onContinue }: LeaderboardRewardProps) {
    const handleContinue = async () => {
        onContinue();
    };

    return (
        <>
            <div className={styles.overlay}></div>
            <div className={styles.rewardContainer}>
                <h2>You topped the leaderboard!</h2>
                {/* TODO: would be nice to have their rank, but not necessary */}
                <Image
                    src={openGift}
                    alt="gem gift box"
                    width={118}
                    height={118}
                />
                <p>You earned {gems} gems</p>
                <button onClick={handleContinue} className={styles.text}>
                    Keep it Going!
                </button>
            </div>
        </>
    );
}
