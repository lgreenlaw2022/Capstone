import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getModuleContent, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";
import CodeEditorInstructions from "@/components/CodeEditorInstructions";
import Hints from "@/components/Hints";
import CodeCheck from "@/components/CodeCheck";
import WarningModal from "@/components/WarningModal";

const CodeChallengePage: React.FC = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>(null);
    const [code, setCode] = useState<string | undefined>("");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [testCasesCompleted, setTestCasesCompleted] =
        useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);

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
            if (testCasesCompleted) {
                await submitCompleteModule(Number(moduleId));
                router.push("/learn");
            }
        } catch (error) {
            console.error("Error setting module as complete:", error);
        }
    };

    const handleGoToSolutionGuide = async () => {
        try {
            if (!testCasesCompleted) {
                setShowWarning(true);
            } else {
                await submitCompleteModule(Number(moduleId));
                const solutionModuleId = Number(moduleId) + 1; // TODO: this is a placeholder, need to get the actual solution module id
                router.push(`/learn/challenge-solution/${solutionModuleId}`);
            }
        } catch (error) {
            console.error("Error continuing to solution guide:", error);
        }
    };

    const handleBack = () => {
        router.push("/learn");
    };

    const handleWarningContinue = () => {
        setShowWarning(false);
        const solutionModuleId = Number(moduleId) + 1;
        router.push(`/learn/challenge-solution/${solutionModuleId}`);
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

            <CodeEditorInstructions />
            <Hints moduleId={Number(moduleId)} />
            {/* TODO: pass the test cases from here? */}
            <CodeCheck
                moduleId={Number(moduleId)}
                onTestCasesCompleted={setTestCasesCompleted}
            />

            <WarningModal
                show={showWarning}
                onClose={() => setShowWarning(false)}
                onContinue={handleWarningContinue}
            />

            <div className={styles.buttonContainer}>
                <button onClick={handleBack} aria-label="Back to learn page">
                    Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!testCasesCompleted}
                    aria-label="Mark module as complete"
                >
                    Complete
                </button>
                <button
                    onClick={handleGoToSolutionGuide}
                    aria-label="View solution guide"
                >
                    Solution Guide
                </button>
            </div>
        </div>
    );
};

export default CodeChallengePage;
