export interface UserModule {
    moduleId: string;
    type: ModuleType;
    // TODO: do I want to also add a completed field to the schema?
    isOpen: boolean;
}

export enum ModuleType {
    // TODO: make sure this enum is adjusted to the right vocab in backend
    CONCEPT_GUIDE = "concept_guide",
    PYTHON_GUIDE = "python_guide",
    RECOGNITION_GUIDE = "recognition_guide",
    QUIZ = "quiz",
    CHALLENGE = "challenge",
    CHALLENGE_SOLUTION = "solution_guide",
}