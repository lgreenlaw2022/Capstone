import { useEffect, useState } from "react";

import styles from "@/styles/CodeCheck.module.css";
import TestCase from "./TestCase";

interface CodeCheckProps {
    onTestCasesCompleted: (completed: boolean) => void;
}
export default function CodeCheck({ onTestCasesCompleted }: CodeCheckProps) {
    const testData = [
        {
            input: "[1, 2]",
            output: "[2, 1]",
            verified: true,
        },
        {
            input: "[1, 2, 3]",
            output: "[3, 2, 1]",
            verified: false,
        },
        {
            input: "[1, 2, 3, 4]",
            output: "[4, 3, 2, 1]",
            verified: false,
        },
    ];

    const [userOutput, setUserOutput] = useState("");
    const [feedback, setFeedback] = useState<string[]>(
        new Array(testData.length).fill("")
    );
    const [testCases, setTestCases] = useState(testData);

    useEffect(() => {
        // retrieve test cases from the backend
        [];
    });

    useEffect(() => {
        const allCompleted = testCases.every(testCase => testCase.verified);
        onTestCasesCompleted(allCompleted);
    }, [testCases, onTestCasesCompleted]);

    const handleCheck = (
        userOutput: string,
        correctOutput: string,
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
            // trigger backend update to mark test case as verified
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
                            handleCheck(userOutput, correctOutput, index)
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
