import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";
import WeeklyGift from "@/components/WeeklyGift";
import { useEffect, useState } from "react";
import { getDailyGoals, getMonthlyGoals } from "@/api/api";
import { Goal } from "../types/GoalTypes";

export default function Goals() {
    const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);

    const fetchGoals = async () => {
        const [dailyData, monthlyData] = await Promise.all([
            getDailyGoals(),
            getMonthlyGoals(),
        ]);
        setDailyGoals(dailyData);
        setMonthlyGoals(monthlyData);
        console.log(dailyData);
        console.log(monthlyData);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    return (
        <div className={styles.goalsContainer}>
            <div className={styles.containerRow}>
                <div>
                    <h2>Daily Goals</h2>
                    <GoalsList goals={dailyGoals} />
                </div>
                <WeeklyGift />
            </div>
            <div className={styles.containerRow}>
                <div>
                    <h2>Monthly Goals</h2>
                    <GoalsList goals={monthlyGoals} />
                </div>
                <h2>Calendar</h2>
            </div>
        </div>
    );
}
