import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.title}>
                <Image src="/assets/favicon.ico" height={30} width={30} alt="AlgoArena logo" />
                <h1>AlgoArena</h1>
            </div>
            <div className={styles.stats}>
                {/* Add calls or props to retrieve values -- likely useEffect */}
                <div className={styles.statItem}>
                    <Image src="/assets/flame.svg" height={26} width={26} alt="streak flame" />
                    <h3>1</h3>
                </div>
                <div className={styles.statItem}>
                    <Image src="/assets/gem.svg" height={26} width={26} alt="gem" />
                    <h3>233</h3>
                </div>
                {/* add prop to import username */}
                <Link href="/profile">
                    <h3 className={styles.profileLink}>Libby Green</h3>
                </Link>
            </div>
        </div>
    );
}