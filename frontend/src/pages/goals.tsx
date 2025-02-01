import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";
import WeeklyGift from "@/components/WeeklyGift";
import { useEffect, useState } from "react";
import { getDailyGoals, getMonthlyGoals } from "@/api/api";
import { Goal } from "../types/GoalTypes";
import GoalReward from "@/components/GoalReward";
import GoalSettingModal from "@/components/GoalSettingModal";

export default function Goals() {
    const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
    const [newlyCompletedGoals, setNewlyCompletedGoals] = useState<Goal[]>([]);
    const [goalsReviewed, setGoalsReviewed] = useState(false);
    const [showGoalSettingModal, setShowGoalSettingModal] = useState(true); // default to true for now

    const fetchGoals = async () => {
        const [dailyData, monthlyData] = await Promise.all([
            getDailyGoals(),
            getMonthlyGoals(),
        ]);
        setDailyGoals(dailyData.goals);
        setMonthlyGoals(monthlyData.goals);
        setNewlyCompletedGoals([
            ...dailyData.newly_completed_goals,
            ...monthlyData.newly_completed_goals,
        ]);
        console.log("Newly completed goals:", newlyCompletedGoals);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleContinue = (goalId: number) => {
        setNewlyCompletedGoals((prevGoals) =>
            prevGoals.filter((goal) => goal.goalId !== goalId)
        );
        // TODO: UX bug, page doesn't reload after all the newly completed goals are processed
        if (newlyCompletedGoals.length === 0) {
            setGoalsReviewed(true);
        }
    };

    return (
        <>
            {newlyCompletedGoals.length > 0 && (
                <GoalReward
                    key={newlyCompletedGoals[0].goalId}
                    goal={newlyCompletedGoals[0]}
                    onContinue={handleContinue}
                />
            )}
            <div className={styles.goalsContainer}>
                <div className={styles.containerRow}>
                    <div>
                        <h2>Daily Goals</h2>
                        <GoalsList goals={dailyGoals} />
                    </div>
                    <div>
                        {/* TODO: will need an onClose to trigger if the user can't set a goal anymore  */}
                        <GoalSettingModal show={showGoalSettingModal} />
                        <WeeklyGift />
                    </div>
                </div>
                <div className={styles.containerRow}>
                    <div>
                        <h2>Monthly Goals</h2>
                        <GoalsList goals={monthlyGoals} />
                    </div>
                    {/* <h2>Calendar</h2> */}
                </div>
            </div>
        </>
    );
}
