import styles from "../styles/Reward.module.css";
import Image from "next/image";
import openGift from "../../public/assets/open-gem-gift.svg";

interface RewardProps {
    title: string;
    gems: number;
    onContinue: () => void;
}

export default function Reward({ title, gems, onContinue }: RewardProps) {
    return (
        <>
            <div className={styles.overlay} />
            <div className={styles.rewardContainer}>
                <h2>{title}</h2>
                <Image
                    src={openGift}
                    alt="gem gift box"
                    width={118}
                    height={118}
                />
                <p>You earned {gems} gems</p>
                <button
                    onClick={onContinue}
                    type="button"
                    className={styles.text}
                >
                    Keep it Going!
                </button>
            </div>
        </>
    );
}
