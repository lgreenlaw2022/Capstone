import styles from "../styles/UserRankCard.module.css";

interface UserRankProps {
    // TODO: make this a type?
    user: {
        username: string;
        xp: number;
    };
    index: number; // safe to use index?
}

export default function UserRankCard({ user, index }: UserRankProps) {
    const rank = index + 1;
    const isTopFive = rank <= 5;

    return (
        <div
            key={index}     
            className={`${styles.rankings} ${isTopFive ? styles.greenHighlight : ""}`}
        >
            <div className={styles.rankText}>
                <h3>{rank}</h3>
                {isTopFive ? (
                    <img src="../assets/gift-small.svg" alt="gift" />
                ) : null}
                <p>{user.username}</p>
            </div>
            <p className={styles.xpText}>{user.xp} XP</p>
        </div>
    );
}
