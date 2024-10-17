import styles from '@/styles/Footer.module.css';
import Image from 'next/image';

export default function Footer() {
    return (
        <div className={styles.footer}>
            About
            <a
                href="https://www.linkedin.com/in/libby-greenlaw/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
            >
                <Image src="/assets/linkedIn-icon.svg" height={14} width={14} alt="linkedIn" />
            </a>
            Copyright @ 2024 AlgoArena. All Rights Reserved.
        </div>
    )
}