import { useRouter } from 'next/router';
import styles from '@/styles/Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const menuItems = [
        { name: 'Learn', path: '/learn' },
        { name: 'Review', path: '/review' },
        { name: 'Goals', path: '/goals' },
        { name: 'Badges', path: '/badges' },
        { name: 'Stats', path: '/stats' },
        { name: 'Profile', path: '/profile' },
    ];

    return (
        <div className={styles.sidebar}>
            {menuItems.map((item) => (
                <div
                    key={item.name}
                    className={`${styles.menuItem} ${router.pathname === item.path ? styles.active : ''}`}
                    onClick={() => router.push(item.path)}
                >
                    {item.name}
                </div>
            ))}
        </div>
    );
}