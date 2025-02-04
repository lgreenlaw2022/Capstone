import GoalsList from "@/components/GoalsList";
import styles from "../styles/Goals.module.css";
import WeeklyGift from "@/components/WeeklyGift";
import { useEffect, useState } from "react";
import { getDailyGoals, getMonthlyGoals, addPersonalGoal } from "@/api/api";
import { Goal, MeasureEnum, TimePeriodEnum } from "../types/GoalTypes";
import GoalReward from "@/components/GoalReward";
import GoalSettingModal from "@/components/GoalSettingModal";

export default function Goals() {
    const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
    const [newlyCompletedGoals, setNewlyCompletedGoals] = useState<Goal[]>([]);
    const [goalsReviewed, setGoalsReviewed] = useState(false);
    const [showGoalSettingModal, setShowGoalSettingModal] = useState(false); // default to true for now

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

    const handleAddGoal = async (
        timePeriod: TimePeriodEnum,
        measure: MeasureEnum,
        goal: number
    ) => {
        // TODO: handle errors
        // TODO: need to convert values somewhere to match the API enums
        await addPersonalGoal(timePeriod, measure, goal);
        setShowGoalSettingModal(false);
        fetchGoals();
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
            {/* TODO: need to change these divs for better content alignment */}
            <div className={styles.goalsContainer}>
                <div className={styles.containerRow}>
                    <div>
                        <h2>Daily Goals</h2>
                        <GoalsList goals={dailyGoals} />
                    </div>
                    <div className={styles.goalRightColumn}>
                        <button onClick={() => setShowGoalSettingModal(true)}>
                            Add Goal
                        </button>
                        {showGoalSettingModal && (
                            <GoalSettingModal
                                // TODO: do I need the show prop still?
                                show={showGoalSettingModal}
                                onClose={() => setShowGoalSettingModal(false)}
                                onAddGoal={handleAddGoal}
                            />
                        )}
                        <WeeklyGift />
                    </div>
                </div>
                <div className={styles.containerRow}>
                    <div>
                        <h2>Monthly Goals</h2>
                        <GoalsList goals={monthlyGoals} />
                    </div>
                </div>
            </div>
        </>
    );
}
