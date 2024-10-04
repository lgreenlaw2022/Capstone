import { useEffect, useState } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

interface UserData {
    username: string;
    streakCount: number;
    gemCount: number;
}

interface HeaderProps {
    showSignUpButton?: boolean;
    showSignInButton?: boolean;
}

export default function Header({ showSignUpButton = false, showSignInButton = false }) {
    const [userData, setUserData] = useState<UserData | null>({ username: 'Libby Green', streakCount: 1, gemCount: 233 });

    // TODO: update with actual API call
    // TODO: will need to make sure it is called whenever values change
    // useEffect(() => {
    //     // Fetch user data from the API
    //     fetch('/api/user')
    //         .then(response => response.json())
    //         .then(data => setUserData(data))
    //         .catch(error => console.error('Error fetching user data:', error));
    // }, []);

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
            {/* Show auth buttons instead of user stats on login and register pages */}
            {showSignUpButton ? (
                <button className={styles.button}>Sign Up</button>
            ) : showSignInButton ? (
                <button className={styles.button}>Sign in</button>
            ) : (
                <div className={styles.stats}>
                    {/* Add calls or props to retrieve values -- likely useEffect */}
                    <div className={styles.statItem}>
                        <Image src="/assets/flame.svg" height={26} width={26} alt="streak flame" />
                        <h3>{userData.streakCount}</h3>
                    </div>
                    <div className={styles.statItem}>
                        <Image src="/assets/gem.svg" height={26} width={26} alt="gem" />
                        <h3>{userData.gemCount}</h3>
                    </div>
                    {/* add prop to import userId */}
                    <Link href="/profile">
                        <h3 className={styles.profileLink}>{userData.username}</h3>
                    </Link>
                </div>
            )}
        </div>
    );
}