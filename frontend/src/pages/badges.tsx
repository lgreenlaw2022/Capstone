import Image from "next/image";
import styles from "../styles/Badges.module.css";

export default function Register() {
    return (
        <div className={styles.badgeContainer}>
            <h2>Badges</h2>
            {/* TODO: conditional badge styling for locked or unlocked? maybe not worth it at this MVP */}
            <div className={styles.badgeGroup}>
                <h3>Concepts</h3>
                {/* TODO: probably will extract these into a component */}
                <div className={styles.conceptBadge}>
                    <div className={styles.contentBadgeText}>
                        <p>Completed Unit</p>
                        <p>Hash Tables</p>
                    </div>
                    <p>Icon goes here</p>
                </div>
            </div>
            <div className={styles.badgeGroup}>
                <h3>Awards</h3>
                <div className={styles.awardBadge}>
                    <p>30 day streak</p>
                    <Image
                        src="/assets/flame.svg"
                        height={26}
                        width={26}
                        alt="streak flame"
                    />
                </div>
            </div>
        </div>
    );
}
