import { useEffect, useState } from 'react';

export interface UserModule {
    moduleId: string;
    type: ModuleType;
    // TODO: do I want to also add a completed field to the schema?
    isOpen: boolean;
}

// TODO: need to add this to the types file
export enum ModuleType {
    // TODO: make sure this enum is adjusted to the right vocab in backend
    CONCEPT_GUIDE = "concept_guide",
    PYTHON_GUIDE = "python_guide",
    RECOGNITION_GUIDE = "recognition_guide",
    QUIZ = "quiz",
    CHALLENGE = "challenge",
    CHALLENGE_SOLUTION = "solution_guide",
}   

const useUserModules = (unitId: number) => {
    const [userModules, setUserModules] = useState<UserModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // TODO: update when the module is fixed
    useEffect(() => {
        const fetchUserModules = async () => {
            try {
                const response = await fetch(`/api/userModules?unitId=${unitId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setUserModules(data);
                setLoading(false);
            } catch (error) {
                setError('Error fetching user modules');
                setLoading(false);
            }
        };

        fetchUserModules();
    }, [unitId]);

    return { userModules, loading, error };
};

export default useUserModules;