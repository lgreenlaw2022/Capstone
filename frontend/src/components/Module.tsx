import React from 'react';
import Image from 'next/image';
import { UserModule, ModuleType } from '../hooks/useUserModules';

interface ModuleItemProps {
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

const ModuleItem: React.FC<ModuleItemProps> = ({ module, onClick }) => {
    const iconSrc = getModuleIcon(module.type, module.isOpen);

    return (
        <div
            className={`unitModule ${module.isOpen ? 'open' : 'closed'}`}
            onClick={onClick}
        >
            <Image src={iconSrc} alt={module.type} width={69} height={65} />
        </div>
    );
};

export default ModuleItem;