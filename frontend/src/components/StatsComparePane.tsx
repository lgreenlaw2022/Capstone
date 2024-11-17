import { useEffect, useState } from "react";
import styles from "../styles/StatsComparePane.module.css";
import { getUserXp } from "@/api/api";

export default function StatsComparePane() {
    const [xp, setXp] = useState<number>(0);

    const fetchXp = async () => {
        try {
            // fetch xp from backend
            const data = await getUserXp();
            setXp(data["xp"]);
        } catch (error) {
            console.error("Error fetching xp", error);
        }
    };

    useEffect(() => {
        fetchXp();
    }, []);

    return (
        <div className={styles.compareContainer}>
            <h2>See how you compare</h2>
            <p>Total XP: {xp}</p>
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
