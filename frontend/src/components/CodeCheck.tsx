import { useEffect, useState } from "react";

import styles from "@/styles/CodeCheck.module.css";
import TestCase from "./TestCase";
import { getUserChallengeTestCases, submitTestCase } from "@/api/api";

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

export default function CodeCheck({
    moduleId,
    onTestCasesCompleted,
}: CodeCheckProps) {
    const [feedback, setFeedback] = useState<string[]>([]);
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    const fetchTestCases = async () => {
        try {
            const data = await getUserChallengeTestCases(moduleId);
            setTestCases(data);
            setFeedback(new Array(data.length).fill(""));
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
        const newFeedback = [...feedback];
        const standardizedUserOutput = userOutput
            .replace(/\s+/g, "")
            .toLowerCase();
        const standardizedCorrectOutput = correctOutput
            .replace(/\s+/g, "")
            .toLowerCase();

        if (standardizedUserOutput === standardizedCorrectOutput) {
            await submitTestCase(testCaseId);

            newFeedback[index] = "Correct!";
            const newTestCases = [...testCases];
            newTestCases[index].verified = true; // TODO: this is overriding the backend, I am not refetching the data in this case
            setTestCases(newTestCases);
        } else {
            newFeedback[index] =
                "Incorrect, try again. Verify your entry follows the correct format.";
        }
        setFeedback(newFeedback);
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
                    {feedback[index] && (
                        <p
                            className={
                                feedback[index] === "Correct!"
                                    ? styles.correctFeedback
                                    : styles.incorrectFeedback
                            }
                        >
                            {feedback[index]}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
