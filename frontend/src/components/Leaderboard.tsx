import styles from "../styles/Leaderboard.module.css";
import { useEffect, useState } from "react";
import UserRankCard from "./UserRankCard";
import { getLeaderboard, getLeaderboardDaysLeft } from "@/api/api";

interface User {
    username: string;
    weekly_xp: number;
}

export default function Leaderboard() {
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [daysLeft, setDaysLeft] = useState(0);
    const [users, setUsers] = useState<User[]>([]);

    const fetchRankings = async () => {
        try {
            const [data, days] = await Promise.all([
                getLeaderboard(),
                getLeaderboardDaysLeft()
            ]);
            setUsers(data);
            setDaysLeft(days);  
        } catch (error) {
            console.error("Error fetching xp", error);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    if (!showLeaderboard) {
        return (
            <div className={styles.noLeaderboardContainer}>
                <div className={styles.headingContainer}>
                    <h2>Weekly Leaderboard</h2>
                    <p className={styles.emphasisText}>Want to compete?</p>
                    <p>Top 5 win prizes</p>
                </div>
                <button onClick={() => setShowLeaderboard(true)}>
                    Show Leaderboard
                </button>
            </div>
        );
    }

    return (
        <div className={styles.leaderboardContainer}>
            <div className={styles.headingContainer}>
                <h2>Weekly Leaderboard</h2>
                <p>Top 5 win prizes</p>
                <p className={styles.emphasisText}>{daysLeft} days left</p>
            </div>
            <div className={styles.rankingsContainer}>
                {users.map((user, index) => (
                    <UserRankCard key={user.username} user={user} index={index} />
                ))}
            </div>
            <div>
                <p>Compared to users with similar habits</p>
                <p
                    className={styles.toggleText}
                    onClick={() => setShowLeaderboard(false)}
                >
                    Hide Leaderboard
                </p>
            </div>
        </div>
    );
}
