import { useEffect, useState } from "react";
import styles from "../styles/StatsComparePane.module.css";
import { getComparisonStats, getUserXp } from "@/api/api";
import Loading from "./Loading";

export default function StatsComparePane() {
    const [xp, setXp] = useState<number>(0);
    const [percentShorterStreak, setPercentShorterStreak] = useState<number>(0);
    const [percentFewerModules, setPercentFewerModules] = useState<number>(0);
    const [percentFewerGoals, setPercentFewerGoals] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [xpData, comparisonStats] = await Promise.all([
                getUserXp(),
                getComparisonStats(),
            ]);
            setXp(xpData["xp"]);
            setPercentShorterStreak(comparisonStats["percent_shorter_streak"]);
            setPercentFewerModules(comparisonStats["percent_fewer_modules"]);
            setPercentFewerGoals(comparisonStats["percent_fewer_goals"]);
        } catch (error) {
            console.error("Error fetching comparison stats data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    if (loading) {
        return <Loading />;
    }

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
