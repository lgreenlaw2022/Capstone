import { useEffect, useState } from 'react';
import { UserModule } from '../types/ModuleTypes';

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