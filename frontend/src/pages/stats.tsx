
import Leaderboard from '@/components/Leaderboard'
import styles from '../styles/Stats.module.css'
import StatsComparePane from '@/components/StatsComparePane'

export default function Stats() {
    return (
        <div className={styles.statsContainer}>
            {/* <StatsComparePane/> */}
            <Leaderboard/>
        </div>
    )
}