import { useEffect, useState } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';

import HeaderDropdownMenu from './HeaderDropdownMenu'

import { getUserStats } from '@/api/api';

interface UserData {
    username: string;
    streak: number;
    gems: number;
}

interface HeaderProps {
    showSignUpButton?: boolean;
    showSignInButton?: boolean;
}

export default function Header({ showSignUpButton = false, showSignInButton = false }: HeaderProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const router = useRouter();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleSignUpClick = () => {
        router.push('/register');
    };

    const handleSignInClick = () => {
        router.push('/login');
    };

    // This isn't being called
    // I have to reload the page after I log in for it to populate the userData
    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const data = await getUserStats();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserStats();
    }, []);

    return (
        <div className={styles.header}>
            <div className={styles.title}>
                <Image src="/assets/favicon.ico" height={30} width={30} alt="AlgoArena logo" />
                <h1>AlgoArena</h1>
            </div>
            {/* Show auth buttons instead of user stats on login and register pages */}
            {showSignUpButton ? (
                <button className={styles.authButton} onClick={handleSignUpClick}>
                    Sign Up
                </button>
            ) : showSignInButton ? (
                <button className={styles.authButton} onClick={handleSignInClick}>
                    Sign in
                </button>
            ) : (
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <Image src="/assets/flame.svg" height={26} width={26} alt="streak flame" />
                        <h3>{userData?.streak}</h3>
                    </div>
                    <div className={styles.statItem}>
                        <Image src="/assets/gem.svg" height={26} width={26} alt="gem" />
                        <h3>{userData?.gems}</h3>
                    </div>
                    {/* add prop to import userId */}
                    <div className={styles.profileContainer}>
                        <h3 className={styles.profileLink} onClick={toggleDropdown}>
                            {userData?.username}
                        </h3>
                        {dropdownVisible && (
                            <HeaderDropdownMenu onClose={() => setDropdownVisible(false)} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
