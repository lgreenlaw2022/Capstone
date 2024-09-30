import React from 'react';
import Image from 'next/image';
import styles from '../styles/Unit.module.css';

// TODO: decide if I want to only declare this once
interface UnitProps {
    unitId: number;
    title: string;
    completion: number;
}

interface Module {
    id: string;
    
}

export default function Unit({ unitId, title, completion }: UnitProps) {
    return (
        <div className={styles.unitContainer}>
            <div className={styles.unitTitleContainer}>
                <div className={styles.unitHeader}>
                    {/* TODO: designate h1, h2 stylings */}
                    <h2 className={styles.unitTitle}>{title}</h2>
                    {/* <Image src="/opened-carrot.svg" alt="Hash Tables" width={14} height={14} /> */}
                </div>
                <div className={styles.unitCompletion}>{completion}% completed</div>
                <button className={styles.reviewButton}>Review</button>
            </div>
            <div className={styles.unitModules}>
                <div className={styles.unitModule}>Module 1</div>
                <div className={styles.unitModule}>Module 2</div>
                <div className={styles.unitModule}>Module 3</div>
                <div className={styles.unitModule}>Module 4</div>
            </div>
        </div>
    );
}