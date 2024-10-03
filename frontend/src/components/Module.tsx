import React, {useMemo} from 'react';
import Image from 'next/image';
import { UserModule, ModuleType } from '../types/ModuleTypes';
import styles from '../styles/Module.module.css';

interface ModuleProps {
    module: UserModule;
    onClick: () => void;
}

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

export default function Module({ module, onClick }: ModuleProps) {
    const iconSrc = useMemo(() => getModuleIcon(module.type, module.isOpen), [module.type, module.isOpen]);


    return (
        <div className={styles.module} >
            <Image src={iconSrc} alt={`${module.type.replace('_', ' ')} icon`} width={69} height={65} onClick={onClick} role="button"/>
        </div>
    );
}