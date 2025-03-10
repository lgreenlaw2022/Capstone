import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";
import WeeklyGift from "@/components/WeeklyGift";
import { useEffect, useState } from "react";
import {
    getDailyGoals,
    getMonthlyGoals,
    addPersonalGoal,
    getShouldShowPersonalGoalButton,
} from "@/api/api";
import { Goal, MeasureEnum, TimePeriodEnum } from "../types/GoalTypes";
import GoalReward from "@/components/GoalReward";
import GoalSettingModal from "@/components/GoalSettingModal";
import Loading from "@/components/Loading";

export default function Goals() {
    const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
    const [newlyCompletedGoals, setNewlyCompletedGoals] = useState<Goal[]>([]);
    const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
    const [showPersonalGoalButton, setShowPersonalGoalButton] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchGoals = async () => {
        try {
            const [dailyData, monthlyData, showButton] = await Promise.all([
                getDailyGoals(),
                getMonthlyGoals(),
                getShouldShowPersonalGoalButton(),
            ]);
            setDailyGoals(dailyData.goals);
            setMonthlyGoals(monthlyData.goals);
            setNewlyCompletedGoals([
                ...dailyData.newly_completed_goals,
                ...monthlyData.newly_completed_goals,
            ]);
            setShowPersonalGoalButton(showButton.showButton);
        } catch (error) {
            // TODO: these try/catch only helps debug, not the user
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchGoals();
    }, []);

    const handleContinue = (goalId: number) => {
        setNewlyCompletedGoals((prevGoals) =>
            prevGoals.filter((goal) => goal.goalId !== goalId)
        );
    };

    const handleAddGoal = async (
        timePeriod: TimePeriodEnum,
        measure: MeasureEnum,
        goal: number
    ) => {
        try {
            await addPersonalGoal(timePeriod, measure, goal);
            setShowGoalSettingModal(false);
            setLoading(true);
            fetchGoals();
        } catch (error) {
            console.error("Failed to add goal:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

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
                <div className={styles.goalLeftColumn}>
                    <div className={styles.goalGroup}>
                        <h2>Daily Goals</h2>
                        <GoalsList goals={dailyGoals} />
                    </div>
                    <div className={styles.goalGroup}>
                        <h2>Monthly Goals</h2>
                        <GoalsList goals={monthlyGoals} />
                    </div>
                </div>
                <div className={styles.goalRightColumn}>
                    {showPersonalGoalButton && (
                        <button
                            type="button"
                            onClick={() => setShowGoalSettingModal(true)}
                        >
                            Change Goal
                        </button>
                    )}
                    {showGoalSettingModal && (
                        <GoalSettingModal
                            onClose={() => setShowGoalSettingModal(false)}
                            onAddGoal={handleAddGoal}
                        />
                    )}
                    <WeeklyGift />
                </div>
            </div>
        </>
    );
}
