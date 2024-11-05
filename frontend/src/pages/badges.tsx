import styles from "../styles/Badges.module.css";
import Badge from "@/components/Badge";

export default function Badges() {
    return (
        <div className={styles.badgeContainer}>
            <h2>Badges</h2>
            {/* TODO: conditional badge styling for locked or unlocked? maybe not worth it at this MVP */}
            <div className={styles.badgeGroup}>
                <h3>Concepts</h3>
                {/* TODO: see what the type value will be mapped as */}
                <Badge title="Hash Tables" type="concept" />
            </div>
            <div className={styles.badgeGroup}>
                <h3>Awards</h3>
                <Badge title="30 day streak" type="award" />
            </div>
        </div>
    );
}
