import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";

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

    const handleEditorDidMount: OnMount = (editor) => {
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
        return (
            <div className={styles.container}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <Editor
                height="60vh"
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
