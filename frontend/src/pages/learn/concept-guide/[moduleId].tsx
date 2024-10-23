import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { getModuleContent } from '../../../api/api';


const ConceptGuidePage = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await getModuleContent(Number(moduleId));
                setContent(data);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };

        if (moduleId) {
            fetchContent();
        }
    }, [moduleId]);

    return (
        <div>
            <div>
                {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default ConceptGuidePage;