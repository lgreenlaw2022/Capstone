import React from 'react';
import styles from '../styles/Unit.module.css';
import { getModulesInUnit } from '../api/api';
import { useEffect, useState } from 'react';
import Module from './Module';
import { ModuleType } from '../types/ModuleTypes';

interface UnitProps {
    unitId: number;
    title: string;
}

interface Module {
    id: number;
    title: string;
    type: ModuleType;
    order: number;
    isOpen: boolean;
}

export default function Unit({ unitId, title }: UnitProps) {
    const [modules, setModules] = useState<Module[]>([]);
    const [completionPercentage, setCompletionPercentage] = useState<number>(0);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                if (unitId) {
                    console.log('Fetching modules for unit:', unitId);
                    const data = await getModulesInUnit(Number(unitId));
                    if (data.modules) {
                        // TODO: it may be better to do a formal mapper here
                        const mappedModules = data.modules.map((module: any) => ({
                            ...module,
                            type: module.module_type as ModuleType // Directly cast the string to the enum type
                        }));
                        setModules(mappedModules);
                    } else {
                        console.error('Modules data is undefined');
                    }
                    setCompletionPercentage(data.completion_percentage);
                }
            } catch (error) {
                console.error('Error fetching modules:', error);
            }
        };

        fetchModules();
    }, [unitId]);

    return (
        <div className={styles.unitContainer}>
            <div className={styles.unitTitleContainer}>
                <div className={styles.unitHeader}>
                    <h2 className={styles.unitTitle}>{title}</h2>
                </div>
                <div className={styles.unitCompletion}>{completionPercentage}% completed</div>
                {completionPercentage === 100 &&
                    <button className={styles.reviewButton}>Review</button>
                }
            </div>
            <div className={styles.unitModules}>
                {modules.map(module => (
                    <Module
                        key={module.id}
                        id={module.id}
                        type={module.type}
                        isOpen={module.isOpen}
                    />
                ))}
            </div>
        </div>
    );
}