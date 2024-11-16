
import Leaderboard from '@/components/Leaderboard'
import styles from '../styles/Stats.module.css'

export default function Stats() {
    return (
        <div className={styles.statsContainer}>
            <div>Comparison pane</div>
            <Leaderboard/>
        </div>
    )
}