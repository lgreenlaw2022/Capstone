import React from 'react';
import Link from 'next/link';
import styles from '@/styles/HeaderDropdownMenu.module.css';
import { useRouter } from 'next/router';

import { logoutUser } from '@/api/api';

const DropdownMenu: React.FC = () => {
    const router = useRouter();

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    return (
        <div className={styles.dropdownMenu}>
            <Link href="/profile">
                <button className={styles.dropdownItem}>
                    Profile
                </button>
            </Link>
            <button className={styles.dropdownItem} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default DropdownMenu;