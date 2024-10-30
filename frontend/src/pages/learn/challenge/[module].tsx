import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/ConceptGuide.module.css";

const CodeChallengePage = () => {
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
            // fetchContent();
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
            <Editor
                height="50vh"
                width={"50%"}
                defaultLanguage="python"
                theme="vs-dark"
                defaultValue="// some comment"
            />
            {/* {content ? (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    <div>
                        <button onClick={handleComplete}>Complete</button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )} */}
        </div>
    );
};

export default CodeChallengePage;
