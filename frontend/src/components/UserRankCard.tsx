import Image from "next/image";

import styles from "../styles/UserRankCard.module.css";
import giftIcon from "../../public/assets/gift-small.svg";
    
interface UserRankProps {
    user: {
        username: string;
        weekly_xp: number;
    };
    index: number;
}

export default function UserRankCard({ user, index }: UserRankProps) {
    const rank = index + 1;
    const isTopFive = rank <= 5;

    return (
        <div
            className={`${styles.rankings} ${isTopFive ? styles.greenHighlight : ""}`}
        >
            <div className={styles.rankText}>
                <h3>{rank}</h3>
                {isTopFive ? <Image src={giftIcon} alt="gift" width={25} height={24} /> : null}
                <p>{user.username}</p>
            </div>
            <p className={styles.xpText}>{user.weekly_xp} XP</p>
        </div>
    );
}
