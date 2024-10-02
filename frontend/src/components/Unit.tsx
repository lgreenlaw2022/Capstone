import React from 'react';
import styles from '../styles/Unit.module.css';
import useUserModules from '../hooks/useUserModules';
import Module from './Module';
import { UserModule, ModuleType } from '../types/ModuleTypes';

// TODO: decide if I want to only declare this once
interface UnitProps {
    unitId: number;
    title: string;
    completion: number;
}

interface Module {
    id: string;
}

const defaultUserModules: UserModule[] = [
    { moduleId: '1', isOpen: true, type: ModuleType.CONCEPT_GUIDE },
    { moduleId: '2', isOpen: true, type: ModuleType.PYTHON_GUIDE },
    { moduleId: '3', isOpen: false, type: ModuleType.RECOGNITION_GUIDE },
    { moduleId: '4', isOpen: false, type: ModuleType.QUIZ },
    { moduleId: '5', isOpen: false, type: ModuleType.CHALLENGE },
];

export default function Unit({ unitId, title, completion }: UnitProps) {
    // const { userModules, loading, error } = useUserModules(unitId);
    const userModules = defaultUserModules; // Use default data for now

    // TODO: update the routing here for click
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
                {completion === 100 &&
                    <button className={styles.reviewButton}>Review</button>
                }
            </div>
            <div className={styles.unitModules}>
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