import React from "react";
import Image from "next/image";
import { ModuleType } from "../types/ModuleTypes";
import styles from "../styles/Module.module.css";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

interface ModuleProps {
    id: number;
    type: ModuleType;
    isOpen: boolean;
}

// load correct icon based on module type and open status
const getModuleIcon = (type: ModuleType, isOpen: boolean) => {
    switch (type) {
        // conditionally render the open or closed icon
        case ModuleType.CONCEPT_GUIDE:
            return isOpen
                ? "/assets/concept-guide-open.svg"
                : "/assets/concept-guide-closed.svg";
        case ModuleType.PYTHON_GUIDE:
            return isOpen
                ? "/assets/python-guide-open.svg"
                : "/assets/python-guide-closed.svg";
        case ModuleType.RECOGNITION_GUIDE:
            return isOpen
                ? "/assets/recognition-guide-open.svg"
                : "/assets/recognition-guide-closed.svg";
        case ModuleType.QUIZ:
            return isOpen ? "/assets/quiz-open.svg" : "/assets/quiz-closed.svg";
        case ModuleType.CHALLENGE:
            return isOpen
                ? "/assets/code-challenge-open.svg"
                : "/assets/code-challenge-closed.svg";
        case ModuleType.CHALLENGE_SOLUTION:
            return isOpen
                ? "/assets/challenge-solution-open.svg"
                : "/assets/challenge-solution-closed.svg";
        default:
            return "";
    }
};

const getModulePath = (type: ModuleType, id: number): string => {
    // return the correct page path based on the module type
    switch (type) {
        case ModuleType.CONCEPT_GUIDE:
            return `/learn/concept-guide/${id}`;
        case ModuleType.PYTHON_GUIDE:
            return `/learn/python-guide/${id}`;
        case ModuleType.RECOGNITION_GUIDE:
            return `/learn/concept-guide/${id}`;
        case ModuleType.QUIZ:
            return `/learn/quiz/${id}`;
        case ModuleType.CHALLENGE:
            return `/learn/challenge/${id}`;
        case ModuleType.CHALLENGE_SOLUTION:
            return `/learn/challenge-solution/${id}`;
        default:
            toast.error("Error opening module.");
            console.warn("Unknown module type:", id);
            return "/learn";
    }
};

export default function Module({ id, type, isOpen }: ModuleProps) {
    const iconSrc = getModuleIcon(type, isOpen);
    const router = useRouter();

    const handleClick = (): void => {
        // only allow click if module is open
        if (isOpen) {
            try {
                // navigate to the correct module page
                const path = getModulePath(type, id);
                router.push(path);
            } catch (error) {
                console.error("Error navigating to module:", error);
                toast.error("Failed to navigate to the module.");
            }
        }
    };

    return (
        <div
            // conditionally apply the open or closed styles
            className={`${styles.module} ${isOpen ? styles.open : styles.closed}`}
            onClick={handleClick}
            role="button"
        >
            <Image
                src={iconSrc}
                alt={`${type.replace("_", " ")} icon`}
                width={69}
                height={65}
            />
        </div>
    );
}
