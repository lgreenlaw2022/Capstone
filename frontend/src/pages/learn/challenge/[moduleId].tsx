import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getCodeChallenge, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";

const CodeChallengePage: React.FC = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>();
    const [code, setCode] = useState<string | undefined>("");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // here is the editor instance, store it in `useRef` for further usage
        editorRef.current = editor;
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                if (moduleId) {
                    const data = await getCodeChallenge(Number(moduleId));
                    setContent(data.html);
                    setCode(data.code);
                }
            } catch (error) {
                console.error("Error fetching code challenge:", error);
            }
        };

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

    const handleEditorChange = (newValue: string | undefined) => {
        setCode(newValue);
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
                    height="50vh"
                    width="100%"
                    defaultLanguage="python"
                    value={code}
                    onChange={handleEditorChange}
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
            {/* TODO: hint component */}
            <p>Hint component will go here</p>
            <button onClick={handleComplete}>Complete</button>
            {/* TODO: add a continue to solution button */}
        </div>
    );
};

export default CodeChallengePage;
