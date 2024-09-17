import styles from '@/styles/Header.module.css';
import Image from 'next/image';

export default function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.title}>
                <Image src="/assets/favicon.ico" height={30} width={30} alt="favicon" />
                <h1>AlgoArena</h1>
            </div>
            <div className={styles.stats}>
                {/* Add calls or props to retrieve values -- likely useEffect */}
                <div className={styles.statItem}>
                    <Image src="/assets/favicon.ico" height={26} width={26} alt="favicon" />
                    <h3>1</h3>
                </div>
                <div className={styles.statItem}>
                    <Image src="/assets/favicon.ico" height={26} width={26} alt="favicon" />
                    <h3>233</h3>
                </div>
                {/* add prop to import username */}
                <h3>Libby Green</h3>
            </div>
        </div>
    );
}