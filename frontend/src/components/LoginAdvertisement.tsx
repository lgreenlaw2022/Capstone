import Image from "next/image";
import styles from "../styles/LoginAdvertisement.module.css";

export default function LoginAdvertisement() {
    return (
        <div className={styles.advertisementContainer}>
            <div className={styles.title}>AlgoArena</div>
            <Image src="/assets/logo-white.svg" alt="logo" height={206} width={187} />
            {/* Marketing taglines */}
            <div className={styles.taglineText}>
                <div className={styles.tagline}>Intelligent Technical Interview Prep</div>
                <div className={styles.subtagline}>A science backed learning platform</div>
            </div>
        </div>
    );
}