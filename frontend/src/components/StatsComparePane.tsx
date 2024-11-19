import { useEffect, useState } from "react";
import styles from "../styles/StatsComparePane.module.css";
import { getComparisonStats, getUserXp } from "@/api/api";

export default function StatsComparePane() {
    const [xp, setXp] = useState<number>(0);
    const [percentShorterStreak, setPercentShorterStreak] = useState<number>(0);
    const [percentFewerModules, setPercentFewerModules] = useState<number>(0);
    const [percentFewerGoals, setPercentFewerGoals] = useState<number>(0);

    const fetchXp = async () => {
        try {
            // fetch xp from backend
            const data = await getUserXp();
            setXp(data["xp"]);
        } catch (error) {
            console.error("Error fetching xp", error);
        }
    };

    const fetchComparisonStats = async () => {
        try {
            // fetch comparison stats from backend
            const stats = await getComparisonStats();
            setPercentShorterStreak(stats["percent_shorter_streak"]);
            setPercentFewerModules(stats["percent_fewer_modules"]);
            setPercentFewerGoals(stats["percent_fewer_goals"]);
        } catch (error) {
            console.error("Error fetching comparison stats", error);
        }
    };

    useEffect(() => {
        fetchXp();
        fetchComparisonStats();
    }, []);

    return (
        <div className={styles.compareContainer}>
            <h2>See how you compare</h2>
            <p>
                Total XP: <span className={styles.boldText}>{xp}</span>
            </p>
            {/* <p> "x" other people are also learning right now</p> */}
            <div className={styles.compareList}>
                <div>
                    <h3>Streak</h3>
                    <p>
                        You have a longer streak than{" "}
                        <span className={styles.boldText}>
                            {percentShorterStreak}%
                        </span>{" "}
                        of users
                    </p>
                </div>
                <div>
                    <h3>Modules</h3>
                    <p>
                        You have completed more modules this week than{" "}
                        <span className={styles.boldText}>
                            {percentFewerModules}%
                        </span>{" "}
                        of users
                    </p>
                </div>
                <div>
                    <h3>Goals</h3>
                    <p>
                        You have completed more goals this week than{" "}
                        <span className={styles.boldText}>
                            {percentFewerGoals}%
                        </span>{" "}
                        of users
                    </p>
                </div>
            </div>
        </div>
    );
}
