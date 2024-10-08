import React from 'react';
import styles from '../styles/Unit.module.css';
import router from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

    // redirect to module page based on module type
    const handleModuleClick = (moduleId: string, moduleType: ModuleType) => {
        try {
            switch (moduleType) {
                case ModuleType.CONCEPT_GUIDE:
                    router.push(`/learn/concept-guide/${moduleId}`);
                    break;
                case ModuleType.PYTHON_GUIDE:
                    router.push(`/learn/python-guide/${moduleId}`);
                    break;
                case ModuleType.RECOGNITION_GUIDE:
                    router.push(`/learn/recognition-guide/${moduleId}`);
                    break;
                case ModuleType.QUIZ:
                    router.push(`/learn/quiz/${moduleId}`);
                    break;
                case ModuleType.CHALLENGE:
                    router.push(`/learn/challenge/${moduleId}`);
                    break;
                case ModuleType.CHALLENGE_SOLUTION:
                    router.push(`/learn/challenge-solution/${moduleId}`);
                    break;
                default:
                    console.error('Unknown module type:', moduleType);
                    throw new Error(`Unknown module type: ${moduleType}`);
            }
        } catch (error) {
            console.error('Error navigating to module:', error);
            toast.error('Failed to navigate to the module.');
        }
    };

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
                {userModules.map(module => (
                    <Module
                        key={module.moduleId}
                        module={module}
                        onClick={() => handleModuleClick(module.moduleId, module.type)}
                    />
                ))}
            </div>
        </div>
    );
}