import React from 'react';
import Image from 'next/image';
import { ModuleType } from '../types/ModuleTypes';
import styles from '../styles/Module.module.css';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface ModuleProps {
    id: number;
    type: ModuleType;
    isOpen: boolean;
}

// load correct icon based on module type and open status
const getModuleIcon = (type: ModuleType, isOpen: boolean) => {
    switch (type) {
        case ModuleType.CONCEPT_GUIDE:
            return isOpen ? '/assets/concept-guide-open.svg' : '/assets/concept-guide-closed.svg';
        case ModuleType.PYTHON_GUIDE:
            return isOpen ? '/assets/python-guide-open.svg' : '/assets/python-guide-closed.svg';
        case ModuleType.RECOGNITION_GUIDE:
            return isOpen ? '/assets/recognition-guide-open.svg' : '/assets/recognition-guide-closed.svg';
        case ModuleType.QUIZ:
            return isOpen ? '/assets/quiz-open.svg' : '/assets/quiz-closed.svg';
        case ModuleType.CHALLENGE:
            return isOpen ? '/assets/code-challenge-open.svg' : '/assets/code-challenge-closed.svg';
        case ModuleType.CHALLENGE_SOLUTION:
            return isOpen ? '/assets/solution-guide-open.svg' : '/assets/solution-guide-closed.svg';
        default:
            return '';
    }
};

export default function Module({ id, type, isOpen }: ModuleProps) {
    const iconSrc = getModuleIcon(type, isOpen);
    const router = useRouter();

    // only allow click if module is open
    const handleClick = () => {
        if (isOpen) {
            try {
                switch (type) {
                    case ModuleType.CONCEPT_GUIDE:
                        router.push(`/learn/concept-guide/${id}`);
                        break;
                    case ModuleType.PYTHON_GUIDE:
                        router.push(`/learn/python-guide/${id}`);
                        break;
                    case ModuleType.RECOGNITION_GUIDE:
                        router.push(`/learn/recognition-guide/${id}`);
                        break;
                    case ModuleType.QUIZ:
                        router.push(`/learn/quiz/${id}`);
                        break;
                    case ModuleType.CHALLENGE:
                        router.push(`/learn/challenge/${id}`);
                        break;
                    case ModuleType.CHALLENGE_SOLUTION:
                        router.push(`/learn/challenge-solution/${id}`);
                        break;
                    default:
                        console.error('Unknown module type:', id);
                        throw new Error(`Unknown module type: ${id}`);
                }
            } catch (error) {
                console.error('Error navigating to module:', error);
                toast.error('Failed to navigate to the module.');
            }

        }
    };

    return (
        <div
            className={`${styles.module} ${isOpen ? styles.open : styles.closed}`}
            onClick={handleClick}
            role="button"
        >
            <Image src={iconSrc} alt={`${type.replace('_', ' ')} icon`} width={69} height={65} />
        </div>
    );
}