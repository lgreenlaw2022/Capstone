import React from 'react';
import styles from '../styles/Unit.module.css';
import router from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserModules from '../hooks/useUserModules';
import { getModulesInUnit } from '../api/api';
import { useEffect, useState } from 'react';
import Module from './Module';
import { ModuleType } from '../types/ModuleTypes';

// TODO: decide if I want to only declare this once
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
    // TODO: calculate this within the unit component
    const completion: number = 50

    useEffect(() => {
        const fetchModules = async () => {
            try {
                if (unitId) {
                    console.log('Fetching modules for unit:', unitId);
                    const data = await getModulesInUnit(Number(unitId));
                    // TODO: it may be better to do a formal mapper here
                    const mappedModules = data.map((module: any) => ({
                        ...module,
                        type: module.module_type as ModuleType // Directly cast the string to the enum type
                    }));
                    setModules(mappedModules);
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
                    {/* TODO: designate h1, h2 stylings */}
                    <h2 className={styles.unitTitle}>{title}</h2>
                </div>
                <div className={styles.unitCompletion}>{completion}% completed</div>
                {completion === 100 &&
                    <button className={styles.reviewButton}>Review</button>
                }
            </div>
            <div className={styles.unitModules}>
                {modules.map(module => (
                    <Module
                        key={module.id}
                        id = {module.id}
                        type={module.type}
                        isOpen={module.isOpen}
                    />
                ))}
            </div>
        </div>
    );
}