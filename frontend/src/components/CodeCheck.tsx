import { useEffect, useState } from "react";

import styles from "@/styles/CodeCheck.module.css";
import TestCase from "./TestCase";
import { getUserChallengeTestCases, submitTestCase, submitRuntimeResponse } from "@/api/api";
import RuntimeCheck from "./RuntimeCheck";

interface CodeCheckProps {
    moduleId: number;
    onTestCasesCompleted: (completed: boolean) => void;
}

// TODO: use this for all?
interface TestCase {
    testCaseId: number;
    input: string;
    output: string;
    verified: boolean;
}

enum TestCaseFeedbackMessages {
    Correct = "Correct!",
    AlreadyComplete = "Correct! You have already submitted the correct answer.",
    Incorrect = "Incorrect, try again. Verify your entry follows the correct format.",
}

export default function CodeCheck({
    moduleId,
    onTestCasesCompleted,
}: CodeCheckProps) {
    const [testCaseFeedback, setTestCaseFeedback] = useState<string[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    const [runtimeFeedback, setRuntimeFeedback] = useState<string>("");
    let targetRuntime: string | "" = "";
    // TODO: what about tracking the user's prior runtime submission?

    const handleRuntimeCheck = async (userRuntime: string, targetRuntime: string) => {
        await submitRuntimeResponse(moduleId, userRuntime);
        // TODO: problem begins here
        // also: am I doing the function pass and callback with the params correctly?
        setRuntimeFeedback("submitted");
    };

    const fetchTestCases = async () => {
        try {
            const data = await getUserChallengeTestCases(moduleId);
            setTestCases(data.testCases);
            targetRuntime = data.targetRuntime;

            const initialTestCaseFeedback = data.testCases.map(
                (testCase: TestCase) =>
                    testCase.verified
                        ? TestCaseFeedbackMessages.AlreadyComplete
                        : ""
            );
            setTestCaseFeedback(initialTestCaseFeedback);
        } catch (error) {
            console.error("Error fetching test cases:", error);
        }
    };

    useEffect(() => {
        fetchTestCases();
    }, []);

    useEffect(() => {
        const allCompleted = testCases.every((testCase) => testCase.verified);
        onTestCasesCompleted(allCompleted);
    }, [testCases, onTestCasesCompleted]);

    const handleCheck = async (
        userOutput: string,
        correctOutput: string,
        testCaseId: number,
        index: number
    ) => {
        const newFeedback = [...testCaseFeedback];
        const standardizedUserOutput = userOutput
            .replace(/\s+/g, "")
            .toLowerCase();
        const standardizedCorrectOutput = correctOutput
            .replace(/\s+/g, "")
            .toLowerCase();

        if (standardizedUserOutput === standardizedCorrectOutput) {
            await submitTestCase(testCaseId);

            newFeedback[index] = TestCaseFeedbackMessages.Correct;
            const newTestCases = [...testCases];
            newTestCases[index].verified = true; // TODO: this is overriding the backend, I am not refetching the data in this case
            setTestCases(newTestCases);
        } else {
            newFeedback[index] = TestCaseFeedbackMessages.Incorrect;
        }
        setTestCaseFeedback(newFeedback);
    };

    return (
        <div className={styles.codeCheck}>
            <h3>Code Check</h3>
            <p>
                Before viewing the solution guide, make sure your code passes
                the following test cases:
            </p>

            {testCases.map((testCase, index) => (
                <div key={index}>
                    <TestCase
                        {...testCase}
                        onCheck={(userOutput, correctOutput) =>
                            handleCheck(
                                userOutput,
                                correctOutput,
                                testCase.testCaseId,
                                index
                            )
                        }
                    />
                    {testCaseFeedback[index] && (
                        <p
                            className={
                                testCaseFeedback[index] ===
                                TestCaseFeedbackMessages.Incorrect
                                    ? styles.incorrectFeedback
                                    : styles.correctFeedback
                            }
                        >
                            {testCaseFeedback[index]}
                        </p>
                    )}
                </div>
            ))}

            <RuntimeCheck
                targetRuntime={targetRuntime}
                onCheck={handleRuntimeCheck}
            />
            {runtimeFeedback && <p>submitted</p>}
        </div>
    );
}
