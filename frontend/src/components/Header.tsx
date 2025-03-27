import { useEffect, useState, useRef } from 'react';
import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    // register click outside event listener for the dropdown
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

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
        // triggering based on router is an imperfect solution, 
        // TODO: revisit as I build use cases for fetching user stats
    }, [router]);

    return (
        <div className={styles.header}>
            <div className={styles.title}>
                <Image src="/assets/logo-blue.svg" height={30} width={30} alt="AlgoArena logo" />
                <h1>AlgoArena</h1>
            </div>
            {/* Show auth buttons instead of user stats on login and register pages */}
            {showSignUpButton ? (
                <Link href="/register" className={styles.authButton}>
                    Sign Up
                </Link>
            ) : showSignInButton ? (
                <Link href="/login" className={styles.authButton}>
                    Sign in
                </Link>
            ) : (
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <Image src="/assets/streak-flame.svg" height={26} width={26} alt="streak flame" />
                        <h3>{userData?.streak}</h3>
                    </div>
                    <div className={styles.statItem}>
                        <Image src="/assets/gem.svg" height={26} width={26} alt="gem" />
                        <h3>{userData?.gems}</h3>
                    </div>
                    <div className={styles.profileContainer} ref={dropdownRef}>
                        <h3 className={styles.profileLink} onClick={toggleDropdown}>
                            {userData?.username}
                        </h3>
                        {dropdownVisible && (
                            <HeaderDropdownMenu />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
