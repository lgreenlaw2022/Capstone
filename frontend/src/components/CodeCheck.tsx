import { useEffect, useState } from "react";

import styles from "@/styles/CodeCheck.module.css";
import TestCase from "./TestCase";
import {
    getUserChallengeTestCases,
    submitTestCase,
    submitRuntimeResponse,
} from "@/api/api";
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

const runtimeComplexityMap: { [key: string]: number } = {
    "O(1)": 1,
    "O(log n)": 2,
    "O(n)": 3,
    "O(n log n)": 4,
    "O(n^2)": 5,
    "O(n^3)": 6,
    "O(2^n)": 7,
    "O(n!)": 8,
};

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
    const [targetRuntime, setTargetRuntime] = useState<string>("");
    // TODO: what about tracking the user's prior runtime submission?

    const handleRuntimeCheck = async (userRuntime: string) => {
        await submitRuntimeResponse(moduleId, userRuntime);
        if (
            runtimeComplexityMap[userRuntime] >
            runtimeComplexityMap[targetRuntime]
        ) {
            setRuntimeFeedback("Can you optimize your solution?");
        } else {
            setRuntimeFeedback("Submitted.");
        }
    };

    const fetchTestCases = async () => {
        try {
            const data = await getUserChallengeTestCases(moduleId);
            setTestCases(data.testCases);
            setTargetRuntime(data.targetRuntime);

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

            {runtimeFeedback && (
                <p
                    className={
                        runtimeFeedback === "Submitted."
                            ? // TODO: don't love it being green because its possible a lower runtime than the target is impossible
                              styles.correctFeedback
                            : styles.incorrectFeedback
                    }
                >
                    {runtimeFeedback}
                </p>
            )}
        </div>
    );
}
