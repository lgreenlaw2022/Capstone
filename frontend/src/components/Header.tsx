import { useEffect, useState } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

import { getUserStats } from '@/api/api';

interface UserData {
    userId: number;
    username: string;
    streakCount: number;
    gemCount: number;
}

export default function Header() {
    const [userData, setUserData] = useState<UserData | null>({ userId: 1, username: 'Libby Green', streakCount: 1, gemCount: 233 });

    // TODO: will need to make sure it is called whenever values change
    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                // In the case where no userId is provided, resort to old data
                if (userData?.userId === undefined) {return userData;}
                const stats = await getUserStats(userData?.userId);
                setUserData((prevData) => {
                    if (prevData) {
                        return {
                            ...prevData,
                            streakCount: stats.streak,
                            gemCount: stats.gems,
                        };
                    }
                    return prevData; // or handle the null case appropriately
                });
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };

        fetchUserStats();
    }, [userData?.userId]);

    // TODO: switch to a custom spinner component
    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.header}>
            <div className={styles.title}>
                <Image src="/assets/favicon.ico" height={30} width={30} alt="AlgoArena logo" />
                <h1>AlgoArena</h1>
            </div>
            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <Image src="/assets/flame.svg" height={26} width={26} alt="streak flame" />
                    <h3>{userData.streakCount}</h3>
                </div>
                <div className={styles.statItem}>
                    <Image src="/assets/gem.svg" height={26} width={26} alt="gem" />
                    <h3>{userData.gemCount}</h3>
                </div>
                {/* add prop to import username */}
                <Link href="/profile">
                    <h3 className={styles.profileLink}>{userData.username}</h3>
                </Link>
            </div>
        </div>
    );
}