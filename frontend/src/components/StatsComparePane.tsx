import styles from "../styles/StatsComparePane.module.css";

export default function StatsComparePane() {

    return (
        <div className={styles.compareContainer}>
            <h2>See how you compare</h2>
            <p> "x" other people are also learning right now</p>
            <div className={styles.compareList}>
                <div>
                    <h3>Streak</h3>
                    <p>You have a longer streak than 31% of users</p>
                </div>
                <div>
                    <h3>Modules</h3>
                    <p>You have completed more modules this week than 56% of users</p>
                </div>
                <div>
                    <h3>Goals</h3>
                    <p>You have completed more goals this week than 56% of users</p>
                </div>
                {/* TODO: update h3 style here */}
            </div>
        </div>
    );
}
