import styles from "../styles/Leaderboard.module.css";
import { useState } from "react";
import UserRankCard from "./UserRankCard";

interface User {
    username: string;
    xp: number;
    // include rank?
}

export default function Leaderboard() {
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [users, setUsers] = useState<User[]>([
        { username: "user1", xp: 100 },
        { username: "user2", xp: 200 },
        { username: "user3", xp: 300 },
        { username: "user4", xp: 400 },
        { username: "user5", xp: 500 },
        { username: "user6", xp: 600 },
    ]);

    if (!showLeaderboard) {
        return (
            <div>
                <div className={styles.headingContainer}>
                    <h1>Weekly Leaderboard</h1>
                    <p>Want to compete?</p>
                    <p>Top 5 win prizes</p>
                    {/* TODO: make dynamic */}
                </div>
                <button onClick={() => setShowLeaderboard(true)}>
                    Show Leaderboard
                </button>
            </div>
        );
    }

    return (
        <div className={styles.leaderboardContainer}>
            {/* TODO: set up alternative view */}
            <div className={styles.headingContainer}>
                <h1>Weekly Leaderboard</h1>
                <p>Top 5 win prizes</p>
                {/* TODO: make dynamic */}
                <p>3 days left</p>
            </div>
            <div className={styles.rankingsContainer}>
                {users.map((user, index) => (
                    <UserRankCard user={user} index={index}/>
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