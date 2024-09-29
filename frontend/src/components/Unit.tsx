import React from 'react';
import Image from 'next/image';
import styles from '../styles/Unit.module.css';

// Define the prop type using an interface
interface UnitProps {
    title: string;
    completion: number;
}

export default function Unit({ title, completion }: UnitProps) {
    return (
        <div className={styles.unitContainer}>
            <div className={styles.unitHeader}>
                {/* TODO: designate h1, h2 stylings */}
                <h2 className={styles.unitTitle}>{title}</h2>
                {/* <Image src="/opened-carrot.svg" alt="Hash Tables" width={14} height={14} /> */}
            </div>
            <div className={styles.unitCompletion}>{completion}% completed</div>
            <button className={styles.reviewButton}>Review</button>
        </div>
    );
}