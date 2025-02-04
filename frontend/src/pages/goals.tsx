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

export default function Goals() {
    const [dailyGoals, setDailyGoals] = useState<Goal[]>([]);
    const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([]);
    const [newlyCompletedGoals, setNewlyCompletedGoals] = useState<Goal[]>([]);
    const [goalsReviewed, setGoalsReviewed] = useState(false);
    const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
    const [showPersonalGoalButton, setShowPersonalGoalButton] = useState(false);

    const fetchGoals = async () => {
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
                        {showPersonalGoalButton && (
                            <button
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
