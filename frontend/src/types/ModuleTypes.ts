export interface UserModule {
    moduleId: string;
    type: ModuleType;
    isOpen: boolean;
}

export enum ModuleType {
    CONCEPT_GUIDE = "CONCEPT_GUIDE",
    PYTHON_GUIDE = "PYTHON_GUIDE",
    RECOGNITION_GUIDE = "RECOGNITION_GUIDE",
    QUIZ = "QUIZ",
    CHALLENGE = "CHALLENGE",
    CHALLENGE_SOLUTION = "CHALLENGE_SOLUTION",
    BONUS_CHALLENGE = "BONUS_CHALLENGE",
    BONUS_SOLUTION = "BONUS_SOLUTION",
}