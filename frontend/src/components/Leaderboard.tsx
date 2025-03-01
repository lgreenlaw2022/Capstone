import styles from "../styles/Leaderboard.module.css";
import { useEffect, useState } from "react";
import UserRankCard from "./UserRankCard";
import {
    getLeaderboard,
    getLeaderboardDaysLeft,
    getLeaderboardPreference,
    setLeaderboardPreference,
} from "@/api/api";
import Reward from "./Reward";

interface User {
    username: string;
    weekly_xp: number;
}

export default function Leaderboard() {
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [daysLeft, setDaysLeft] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [rewardDue, setRewardDue] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);

    const fetchRankings = async () => {
        try {
            const [data, days, preference] = await Promise.all([
                getLeaderboard(),
                getLeaderboardDaysLeft(),
                getLeaderboardPreference(),
            ]);
            setUsers(data.users);
            setRewardDue(data.rewardDue);
            setRewardAmount(data.rewardAmount);
            setDaysLeft(days);
            setShowLeaderboard(preference);
        } catch (error) {
            console.error("Error fetching xp", error);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    const handleContinue = () => {
        setRewardDue(false);
    };

    const updateLeaderboardPreference = async (preference: boolean) => {
        try {
            await setLeaderboardPreference(preference);
            setShowLeaderboard(preference);
        } catch (error) {
            console.error("Error updating leaderboard preference", error);
        }
    };

    if (!showLeaderboard) {
        return (
            <div className={styles.noLeaderboardContainer}>
                <div className={styles.headingContainer}>
                    <h2>Weekly Leaderboard</h2>
                    <p className={styles.emphasisText}>Want to compete?</p>
                    <p>Top 5 win prizes</p>
                </div>
                <button type="button" onClick={() => updateLeaderboardPreference(true)}>
                    Show Leaderboard
                </button>
            </div>
        );
    }

    return (
        <div className={styles.leaderboardContainer}>
            {rewardDue && (
                // TODO: add rank?
                <Reward
                    title="You topped the leaderboard!"
                    gems={rewardAmount}
                    onContinue={handleContinue}
                />
            )}
            <div className={styles.headingContainer}>
                <h2>Weekly Leaderboard</h2>
                <p>Top 5 win prizes</p>
                <p className={styles.emphasisText}>{daysLeft} days left</p>
            </div>
            <div className={styles.rankingsContainer}>
                {users.map((user, index) => (
                    <UserRankCard
                        key={user.username}
                        user={user}
                        index={index}
                    />
                ))}
            </div>
            <div>
                <p>Compared to users with similar habits</p>
                <p
                    className={styles.toggleText}
                    onClick={() => updateLeaderboardPreference(false)}
                >
                    Hide Leaderboard
                </p>
            </div>
        </div>
    );
}
