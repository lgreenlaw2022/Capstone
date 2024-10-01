import React from 'react';
import Image from 'next/image';
import styles from '../styles/Unit.module.css';
import useUserModules from '../hooks/useUserModules';
import Module from './Module';

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
    const { userModules, loading, error } = useUserModules(unitId);

    const handleModuleClick = async (moduleId: string) => {
        console.log(`Module ${moduleId} clicked`);
    };

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
                {/* Info that modules need:
                    - module type
                    - open status
                    - needs to be a button
                    - need to be able to route the button on click
                        - how am I going to do this?
                */}
                {userModules.map(module => (
                    <Module
                        key={module.moduleId}
                        module={module}
                        onClick={() => handleModuleClick(module.moduleId)}
                    />
                ))}
            </div>
        </div>
    );
}