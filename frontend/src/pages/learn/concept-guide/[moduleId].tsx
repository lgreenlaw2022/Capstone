import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";

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
                console.error("Error fetching content:", error);
            }
        };

        if (moduleId) {
            fetchContent();
        }
    }, [moduleId]);

    const handleComplete = async () => {
        try {
            await submitCompleteModule(Number(moduleId));
            router.push("/learn");
        } catch (error) {
            console.error("Error setting module as complete:", error);
        }
    };

    return (
        <div className={styles.container}>
            {content ? (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    {/* TODO: this button doesn't have proper margins now */}
                    <div>
                        <button onClick={handleComplete}>Complete</button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ConceptGuidePage;
