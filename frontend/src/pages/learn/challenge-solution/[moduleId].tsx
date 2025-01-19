import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";

// TODO: REFACTORING -- this page is very similar to the CodeChallengePage,
// consider what should be extracted to a component
const ChallengeSolutionPage: React.FC = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>(null);
    const [code, setCode] = useState<string | undefined>("");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const fetchContent = async () => {
        try {
            if (moduleId) {
                const data = await getModuleContent(Number(moduleId));
                setContent(data.html);
                setCode(data.code);
            }
        } catch (error) {
            console.error("Error fetching challenge solution guide:", error);
        }
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // here is the editor instance, store it in `useRef` for further usage
        editorRef.current = editor;
    };

    const handleComplete = async () => {
        try {
            await submitCompleteModule(Number(moduleId));
            router.push("/learn");
        } catch (error) {
            console.error("Error setting module as complete:", error);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [moduleId]);

    if (!content) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <Editor
                height="30vh" // TODO: this height will need to be variable
                width="100%"
                defaultLanguage="python"
                value={code}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                className={styles.editor}
                options={{
                    fontSize: 14,
                    minimap: {
                        enabled: false,
                    },
                    readOnly: true,
                    contextmenu: false,
                }}
            />
            <button
                type="button"
                onClick={handleComplete}
                aria-label="Mark code solution as complete"
            >
                Complete
            </button>
        </div>
    );
};

export default ChallengeSolutionPage;
