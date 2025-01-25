import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";
import CodeEditorInstructions from "@/components/CodeEditorInstructions";
import Hints from "@/components/Hints";

const CodeChallengePage: React.FC = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>(null);
    const [code, setCode] = useState<string | undefined>("");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // here is the editor instance, store it in `useRef` for further usage
        editorRef.current = editor;
    };

    const fetchContent = async () => {
        try {
            if (moduleId) {
                const data = await getModuleContent(Number(moduleId));
                setContent(data.html);
                setCode(data.code);
            }
        } catch (error) {
            console.error("Error fetching code challenge:", error);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [moduleId]);

    const handleComplete = async () => {
        try {
            await submitCompleteModule(Number(moduleId));
            router.push("/learn");
        } catch (error) {
            console.error("Error setting module as complete:", error);
        }
    };

    // Show loading state until content is fetched
    if (!content) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <div>
                <div dangerouslySetInnerHTML={{ __html: content }} />
                <Editor
                    height="25vh"
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
            </div>
            <Hints moduleId={Number(moduleId)}/> 
            <CodeEditorInstructions />

            <button
                onClick={handleComplete}
                aria-label="Mark module as complete"
            >
                Complete
            </button>
            {/* TODO: add a continue to solution button -- this will be necessary for bonus challenges*/}
        </div>
    );
};

export default CodeChallengePage;
