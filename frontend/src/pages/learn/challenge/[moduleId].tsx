import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import {
    getCodeChallengeSolution,
    getModuleContent,
    submitCompleteModule,
} from "../../../api/api";
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

    const handleEditorDidMount: OnMount = (editor) => {
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

    const fetchSolutionData = async (moduleId: number) => {
        try {
            const solutionData = await getCodeChallengeSolution(moduleId);
            return solutionData;
        } catch (error) {
            console.error("Error fetching solution data:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchContent();
    }, [moduleId]);

    const handleComplete = async () => {
        try {
            // allow user to mark module as complete only if test cases are completed
            if (testCasesCompleted) {
                await submitCompleteModule(Number(moduleId));
                const solutionData = await fetchSolutionData(Number(moduleId));
                // if the module is a bonus challenge, redirect to the review page
                if (solutionData.moduleType === "BONUS_CHALLENGE") {
                    router.push("/review");
                } else {
                    // otherwise, the module is a normal challenge, redirect to the learn page
                    router.push("/learn");
                }
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
                // if the user has completed the test cases, make sure to mark the module as complete
                await submitCompleteModule(Number(moduleId));
                const solutionData = await fetchSolutionData(Number(moduleId));
                // then redirect to the solution guide
                const solutionModuleId = solutionData.solutionId;
                router.push(`/learn/challenge-solution/${solutionModuleId}`);
            }
        } catch (error) {
            console.error("Error continuing to solution guide:", error);
        }
    };

    const handleBack = () => {
        router.push("/learn");
    };

    const handleWarningContinue = async () => {
        // redirect the user to the solution guide without marking the module as complete
        setShowWarning(false);
        const solutionData = await fetchSolutionData(Number(moduleId));
        const solutionModuleId = solutionData.solutionId;
        router.push(`/learn/challenge-solution/${solutionModuleId}`);
    };

    // Show loading state until content is fetched
    if (!content) {
        return (
            <div className={styles.container}>
                <p>Loading...</p>
            </div>
        );
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
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Back to learn page"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!testCasesCompleted}
                    aria-label="Mark module as complete"
                >
                    Complete
                </button>
                <button
                    type="button"
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
